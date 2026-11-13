import { ALL_SPORTS } from '../../lib/filterLeagues';
import styles from './SportSelect.module.css';

type SportSelectProps = {
  sports: string[];
  value: string;
  onChange: (value: string) => void;
};

export function SportSelect({ sports, value, onChange }: SportSelectProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="sport-select">
        Sport
      </label>
      <select
        id="sport-select"
        className={styles.select}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value={ALL_SPORTS}>All sports</option>
        {sports.map((sport) => (
          <option key={sport} value={sport}>
            {sport}
          </option>
        ))}
      </select>
    </div>
  );
}
