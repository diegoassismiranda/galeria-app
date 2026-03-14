export default function Toast({ msg, type = 'success' }) {
  return (
    <div className="toast-wrap">
      <div className={`toast ${type}`}>{msg}</div>
    </div>
  )
}
