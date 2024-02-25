# Use a base Python image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /python-server

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose port 5004 for Flask-SocketIO
EXPOSE 5004

CMD ["python", "app.py"]
