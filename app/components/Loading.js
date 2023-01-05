const Loading = ({ loading, children }) => {
  if (loading) return <div>Loading...</div>

  return <>{children}</>
}

export default Loading
