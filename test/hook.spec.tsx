import * as React from 'react';
import { render } from '@testing-library/react';

import { useTreeChanges } from '../src';

jest.useFakeTimers();

const mockFn = jest.fn();

const Component = (props: any) => {
  const { changed } = useTreeChanges(props);

  React.useEffect(() => {
    if (changed()) {
      mockFn(props);
    }
  }, [changed]);

  return <div>Update</div>;
};

describe('useTreeChanges', () => {
  afterEach(() => {
    mockFn.mockReset();
  });

  it('should trigger the callback when props change', () => {
    const props = { padding: 10, ratio: 1, size: 12 };
    const { rerender } = render(<Component {...props} />);

    expect(mockFn).toHaveBeenCalledTimes(0);

    rerender(<Component {...props} padding={20} size={16} />);
    rerender(<Component {...props} padding={20} size={16} />);

    expect(mockFn).toHaveBeenCalledTimes(1);

    rerender(<Component {...props} />);
    rerender(<Component {...props} />);

    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
