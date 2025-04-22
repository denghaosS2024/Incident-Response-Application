import { IExerciseBlock } from "@/models/Exercise";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import ExerciseBlockItem from "../Exercise/ExerciseBlockItem";

interface ExerciseBlockFieldProps {
  blockList: IExerciseBlock[];
  setBlockList: (blocks: IExerciseBlock[]) => void;
  onValidationChange: (hasError: boolean) => void;
}

export default function ExerciseBlockField({
  blockList,
  setBlockList,
  onValidationChange,
}: ExerciseBlockFieldProps) {
  const [blockErrors, setBlockErrors] = useState<boolean[]>([]);

  useEffect(() => {
    setBlockErrors((prev) => {
      if (prev.length !== blockList.length) {
        return new Array(blockList.length).fill(true);
      }
      return prev;
    });
  }, [blockList]);

  const handleValidate = (index: number, hasError: boolean) => {
    setBlockErrors((prev) => {
      const updated = [...prev];
      updated[index] = hasError;
      onValidationChange(updated.some((err) => err));
      return updated;
    });
  };

  const handleAddBlock = () => {
    setBlockList([...blockList, { guide: "", videoUrl: "" }]);
  };

  const handleRemoveBlock = (index: number) => {
    setBlockList(blockList.filter((_, i) => i !== index));
  };

  const handleChangeBlock = (
    index: number,
    field: "guide" | "videoUrl",
    value: string,
  ) => {
    const updated = blockList.map((block, i) =>
      i === index ? { ...block, [field]: value } : block,
    );
    setBlockList(updated);
  };

  return (
    <div>
      {blockList.map((block, idx) => (
        <ExerciseBlockItem
          key={idx}
          index={idx}
          guide={block.guide}
          videoUrl={block.videoUrl}
          onDelete={handleRemoveBlock}
          onChange={handleChangeBlock}
          onValidate={handleValidate}
        />
      ))}
      <Button variant="outlined" onClick={handleAddBlock}>
        + Add New Block
      </Button>
    </div>
  );
}
