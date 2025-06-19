import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <>
      <Head>
        <title>ax-slides</title>
        <meta name="description" content="A simple tool to add visual aids to our weekly meetings" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1>ax-slides</h1>
          {/* <p>a simple tool to add visual aids to our weekly meetings.</p> */}
          <p>1. if you need any visual aids during the meeting, add slides to the current week's Google Slides by clicking "add slides". this is optional. </p>
          <p>2. on the meeting room mac mini, open this website and click "Present".</p>
          <p>make sure you're logged into your uchicago google account.</p>
          <a href="https://docs.google.com/presentation/d/1CSDWx_aHxuE7g96BBWCdCUqJZxr_FsZaB5aZoCHE9pU/edit?slide=id.p#slide=id.p">
            <button className={styles.button}>add slides</button>
          </a>
          <a href="https://docs.google.com/presentation/d/e/2PACX-1vQQTk-mNUYZYpH0UU87M961RJ8FJxHnY5-REyHAd-Dq2U-BOx_N0DlVOc5fpNTmzHEbCeTzBxU8rif0/pub?start=false&loop=true&delayms=60000">
            <button className={styles.button}>present</button>
          </a>
          <br /><br />
          <p>github: <a href="https://github.com/anupsathya/ax-slides">ax-slides</a></p>
        </div>
      </main>
    </>
  );
} 