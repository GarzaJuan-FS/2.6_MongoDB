import React from "react";

const TestComponent = () => {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    console.log("TestComponent: Starting API call...");

    fetch("http://localhost:3001/api/games")
      .then((response) => {
        console.log("TestComponent: Response received", response);
        return response.json();
      })
      .then((data) => {
        console.log("TestComponent: Data received", data);
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("TestComponent: Error", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>API Test</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default TestComponent;
