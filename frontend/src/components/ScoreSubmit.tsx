import { Send } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface ScoreSubmitProps {
  score: number;
  maxLength: number;
  disabled: boolean;
  onSubmit: (playerName: string) => Promise<void>;
}

export function ScoreSubmit({ score, maxLength, disabled, onSubmit }: ScoreSubmitProps) {
  const [playerName, setPlayerName] = useState('PLAYER 1');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(playerName);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="score-submit" onSubmit={handleSubmit}>
      <label htmlFor="playerName">Name</label>
      <input
        id="playerName"
        maxLength={maxLength}
        value={playerName}
        onChange={(event) => setPlayerName(event.target.value)}
        disabled={disabled || submitting}
      />
      <button type="submit" disabled={disabled || submitting || score <= 0}>
        <Send size={16} />
        <span>{submitting ? 'Saving' : 'Save'}</span>
      </button>
    </form>
  );
}
