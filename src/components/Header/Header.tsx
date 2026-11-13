import styles from './Header.module.css';

export function Header() {
  return (
    <header>
      <div className={styles.topBar}>
        <h1 className={`${styles.inner} ${styles.wordmark}`}>League List</h1>
      </div>
      <div className={styles.subBar}>
        <p className={`${styles.inner} ${styles.tagline}`}>
          Browse leagues and their season badges
        </p>
      </div>
    </header>
  );
}
