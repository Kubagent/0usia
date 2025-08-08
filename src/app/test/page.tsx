export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontSize: '24px' }}>
      <h1>Basic Test Page</h1>
      <p>If you see this, Next.js is working!</p>
      <p>Current time: {new Date().toString()}</p>
    </div>
  );
}