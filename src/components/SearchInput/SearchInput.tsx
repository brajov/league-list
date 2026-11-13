import styles from './SearchInput.module.css';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="league-search">
        Search leagues
      </label>
      <input
        id="league-search"
        className={styles.input}
        type="search"
        placeholder="e.g. Premier League"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
