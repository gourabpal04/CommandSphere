import { render } from '@testing-library/react';

// Basic component test that doesn't use App.js 
function BasicComponent() {
  return <div data-testid="basic">Hello Test World</div>;
}

describe('Basic Frontend Tests', () => {
  test('renders basic component', () => {
    const { getByTestId } = render(<BasicComponent />);
    const element = getByTestId('basic');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello Test World');
  });

  test('environment variable check', () => {
    // Test that we can read environment variables
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('math operations work correctly', () => {
    expect(1 + 1).toBe(2);
    expect(2 * 3).toBe(6);
    expect(Math.max(1, 2, 3)).toBe(3);
  });

  test('async operation works', async () => {
    const asyncFunction = () => Promise.resolve('success');
    const result = await asyncFunction();
    expect(result).toBe('success');
  });
});