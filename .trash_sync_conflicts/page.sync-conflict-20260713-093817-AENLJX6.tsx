export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <script
        dangerouslySetInnerHTML={{ __html: `window.location.href = '/dashboard';` }}
      />
    </div>
  );
}
