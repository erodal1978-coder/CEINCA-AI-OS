import { Highlight, Underline } from "@remotion/rough-notation";

type Props = {
  text: string;
  phrase?: string;
  progress: number;
  color: string;
  type: "highlight" | "underline";
};

// Wraps the first occurrence of `phrase` inside `text` with a rough-notation
// annotation. Falls back to plain text if the phrase isn't found, so the
// prop stays safe to edit from the Studio sidebar.
export const HighlightedText: React.FC<Props> = ({ text, phrase, progress, color, type }) => {
  const idx = phrase ? text.toLowerCase().indexOf(phrase.toLowerCase()) : -1;

  if (idx === -1) {
    return <>{text}</>;
  }

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + (phrase as string).length);
  const after = text.slice(idx + (phrase as string).length);

  return (
    <>
      {before}
      {type === "highlight" ? (
        <Highlight color={color} progress={progress}>
          {match}
        </Highlight>
      ) : (
        <Underline color={color} strokeWidth={5} progress={progress}>
          {match}
        </Underline>
      )}
      {after}
    </>
  );
};
