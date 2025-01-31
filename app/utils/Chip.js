export default function Chip({ value, onDragStart }) {
  return (
    <div
      className="chip w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-grab"
      draggable
      onDragStart={(e) => onDragStart(e, value)}
    >
      ${value}
    </div>
  );
}
