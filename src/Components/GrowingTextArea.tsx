import {ChangeEvent} from 'react';
import styles from './GrowingTextArea.module.scss';

// https://css-tricks.com/auto-growing-inputs-textareas/
export default function GrowingTextArea({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div data-value={value} className={styles.sizer}>
      <textarea
        placeholder="Add notes.."
        rows={1}
        value={value}
        onInput={onChange}
        className={`resize-none rounded-xl bg-gray-200
                    placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400
                    dark:bg-gray-700 dark:placeholder-gray-400`}
      />
    </div>
  );
}
