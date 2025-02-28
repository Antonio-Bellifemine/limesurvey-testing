# Use the official Playwright image with pre-installed browsers
FROM mcr.microsoft.com/playwright:latest

# Set working directory
WORKDIR /UI

# Copy package.json and install dependencies
# Copy the entire UI directory
COPY UI/ .

# install yarn
RUN npm install --global yarn

# Install Playwright browsers (already done in base image, but ensures compatibility)
RUN yarn install:deps

# Command to run tests in headless mode
CMD ["yarn", "test:ess:spt"]