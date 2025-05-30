# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# --no-cache-dir: Disables the cache, which can reduce image size.
# --trusted-host pypi.python.org: Can be useful if there are issues with SSL/TLS for PyPI.
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container at /app
# This assumes your FastAPI application is within an 'app' subdirectory in 'backend/'
COPY ./app /app/app

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable for Python path if needed (though often not necessary with this structure)
# ENV PYTHONPATH=/app

# Run app.main:app when the container launches
# Use uvicorn to run the FastAPI application.
# --host 0.0.0.0 makes the server accessible from any IP address (necessary for Docker).
# --port 8000 matches the EXPOSE instruction.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
