function ErrorMessage({ message }) {
  return (
    <div className="error-message">

      <strong>
        Something went wrong
      </strong>

      <p>
        {message || "Unable to load weather data."}
      </p>

    </div>
  );
}

export default ErrorMessage;