import styles from './landing-techniques.module.sass'

export default function landingTechniques() {
  return <div className='w-[100vw] h-[100vh] overflow-hidden flex'>
    <div className='flex flex-col'>
      <div className={styles.techniqueName}>
        Techniques
      </div>

      {/*image to something*/}
    </div>

    <div className='flex flex-col'>
      <div className={styles.explore}>
        Explore Indian Textiles through the process and methods that bring them to life.
      </div>

      <div className={styles.techniquesList}>
        {/*get techniques list*/}
      </div>
    </div>
  </div>
}
