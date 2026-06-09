export function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>{description ?? 'Trang này đang được phát triển.'}</p>
    </div>
  );
}
