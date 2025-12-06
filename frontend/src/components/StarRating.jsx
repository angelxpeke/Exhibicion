export default function StarRating({ value = 0, max = 5, onChange, size = 22 }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div aria-label={`Puntuación: ${value}/${max}`}>
      {stars.map((n) => (
        <span
          key={n}
          onClick={() => onChange?.(n)}
          style={{
            cursor: 'pointer',
            color: n <= value ? '#f5b301' : '#888',
            fontSize: size,
            marginRight: 4,
          }}
          title={`${n} estrella${n > 1 ? 's' : ''}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}