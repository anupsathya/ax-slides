import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';

// Types for better type safety
interface ArchiveResponse {
  success: boolean;
  message: string;
  data?: {
    copiedSlides: number;
    deletedSlides: number;
    archiveId: string;
    currentId: string;
  };
  error?: string;
}

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// Configuration
const CONFIG = {
  CURRENT_SLIDES_ID: process.env.CURRENT_SLIDES_ID!,
  ARCHIVE_SLIDES_ID: process.env.ARCHIVE_SLIDES_ID!,
  SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!,
} as const;

// Utility functions
class Logger {
  static log(message: string, data?: any) {
    console.log(`[${new Date().toISOString()}] ${message}`, data || '');
  }

  static error(message: string, error?: any) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error || '');
  }
}

class GoogleSlidesService {
  private slides: any;
  private drive: any;

  constructor(serviceAccount: ServiceAccount) {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: [
        'https://www.googleapis.com/auth/presentations',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    this.slides = google.slides({ version: 'v1', auth });
    this.drive = google.drive({ version: 'v3', auth });
  }

  async copySlidesToArchive(): Promise<number> {
    Logger.log('Starting slide copy process...');
    
    try {
      // Get all slides from current presentation
      const currentPresentation = await this.slides.presentations.get({
        presentationId: CONFIG.CURRENT_SLIDES_ID,
      });

      const slides = currentPresentation.data.slides || [];
      Logger.log(`Found ${slides.length} slides to copy`);

      if (slides.length === 0) {
        Logger.log('No slides to copy');
        return 0;
      }

      // Copy each slide to archive
      const copyRequests = slides.map((slide: any, index: number) => ({
        copyPaste: {
          objectId: slide.objectId,
          destinationObjectId: `slide_${index + 1}`,
        },
      }));

      await this.slides.presentations.batchUpdate({
        presentationId: CONFIG.ARCHIVE_SLIDES_ID,
        requestBody: {
          requests: copyRequests,
        },
      });

      Logger.log(`Successfully copied ${slides.length} slides to archive`);
      return slides.length;
    } catch (error) {
      Logger.error('Failed to copy slides', error);
      throw new Error(`Failed to copy slides: ${error}`);
    }
  }

  async clearCurrentSlides(): Promise<number> {
    Logger.log('Starting slide deletion process...');
    
    try {
      // Get all slides from current presentation
      const currentPresentation = await this.slides.presentations.get({
        presentationId: CONFIG.CURRENT_SLIDES_ID,
      });

      const slides = currentPresentation.data.slides || [];
      Logger.log(`Found ${slides.length} slides to delete`);

      if (slides.length === 0) {
        Logger.log('No slides to delete');
        return 0;
      }

      // Delete all slides except the first one (templates often need at least one slide)
      const deleteRequests = slides.slice(1).map((slide: any) => ({
        deleteObject: {
          objectId: slide.objectId,
        },
      }));

      if (deleteRequests.length > 0) {
        await this.slides.presentations.batchUpdate({
          presentationId: CONFIG.CURRENT_SLIDES_ID,
          requestBody: {
            requests: deleteRequests,
          },
        });
      }

      Logger.log(`Successfully deleted ${deleteRequests.length} slides from current deck`);
      return deleteRequests.length;
    } catch (error) {
      Logger.error('Failed to delete slides', error);
      throw new Error(`Failed to delete slides: ${error}`);
    }
  }

  async validateAccess(): Promise<void> {
    Logger.log('Validating access to both presentations...');
    
    try {
      // Check access to current presentation
      await this.slides.presentations.get({
        presentationId: CONFIG.CURRENT_SLIDES_ID,
      });

      // Check access to archive presentation
      await this.slides.presentations.get({
        presentationId: CONFIG.ARCHIVE_SLIDES_ID,
      });

      Logger.log('Access validation successful');
    } catch (error) {
      Logger.error('Access validation failed', error);
      throw new Error(`Access validation failed: ${error}`);
    }
  }
}

// Main archive function
async function performArchive(): Promise<ArchiveResponse> {
  try {
    // Validate environment variables
    if (!CONFIG.CURRENT_SLIDES_ID || !CONFIG.ARCHIVE_SLIDES_ID || !CONFIG.SERVICE_ACCOUNT_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Parse service account
    const serviceAccount: ServiceAccount = JSON.parse(CONFIG.SERVICE_ACCOUNT_KEY);

    // Initialize Google Slides service
    const slidesService = new GoogleSlidesService(serviceAccount);

    // Validate access
    await slidesService.validateAccess();

    // Copy slides to archive
    const copiedSlides = await slidesService.copySlidesToArchive();

    // Clear current slides
    const deletedSlides = await slidesService.clearCurrentSlides();

    Logger.log('Archive process completed successfully');

    return {
      success: true,
      message: 'Weekly slides archived successfully',
      data: {
        copiedSlides,
        deletedSlides,
        archiveId: CONFIG.ARCHIVE_SLIDES_ID,
        currentId: CONFIG.CURRENT_SLIDES_ID,
      },
    };
  } catch (error) {
    Logger.error('Archive process failed', error);
    return {
      success: false,
      message: 'Failed to archive weekly slides',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Vercel API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ArchiveResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST.',
    });
  }

  try {
    Logger.log('Archive request received');
    
    const result = await performArchive();
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    Logger.error('Unexpected error in API handler', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
