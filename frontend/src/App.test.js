import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock environment variable
process.env.REACT_APP_BACKEND_URL = 'http://localhost:8000';

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders App component', () => {
    // Mock successful API response
    mockedAxios.get.mockResolvedValueOnce({
      data: { message: 'Hello World' }
    });

    render(<App />);
    
    // Check if the main text is rendered
    const linkElement = screen.getByText(/Building something incredible ~/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('renders the Emergent logo link', () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { message: 'Hello World' }
    });

    render(<App />);
    
    // Check if the logo link exists
    const logoLink = screen.getByRole('link');
    expect(logoLink).toHaveAttribute('href', 'https://emergent.sh');
    expect(logoLink).toHaveAttribute('target', '_blank');
  });

  test('calls API on component mount', async () => {
    // Mock successful API response
    mockedAxios.get.mockResolvedValueOnce({
      data: { message: 'Hello World' }
    });

    render(<App />);

    // Wait for the API call to be made
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  test('handles API error gracefully', async () => {
    // Mock console.error to check if it's called
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock API error
    const error = new Error('API Error');
    mockedAxios.get.mockRejectedValueOnce(error);

    render(<App />);

    // Wait for the error to be handled
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(error, 'errored out requesting / api');
    });

    // Restore console.error
    consoleSpy.mockRestore();
  });

  test('contains correct CSS classes', () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { message: 'Hello World' }
    });

    render(<App />);
    
    // Check for specific CSS classes
    const appHeader = document.querySelector('.App-header');
    expect(appHeader).toBeInTheDocument();
    
    const appLink = document.querySelector('.App-link');
    expect(appLink).toBeInTheDocument();
  });
});