import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <h1 className={styles.wordmark}>League List</h1>
        <p className={styles.tagline}>Browse leagues and their season badges</p>
      </div>
    </header>
  );
}
