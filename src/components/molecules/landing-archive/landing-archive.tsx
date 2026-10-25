import styles from './landing-archive.module.sass'

export default function LandingArchive() {
  return <div className='w-[100vw] h-[100vh] overflow-hidden flex'>
    <div className={styles.title}>
      Archive
    </div>
    {/*load all posts virtualised*/}
  </div>
}
