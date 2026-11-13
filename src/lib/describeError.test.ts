import { describe, expect, it } from 'vitest';
import { ApiError } from '../api/client';
import { describeError } from './describeError';

describe('describeError', () => {
  it('points at the connection and the rate limit for a network error', () => {
    expect(describeError(new ApiError('network', 'x'))).toMatch(/connection.*wait a minute/);
  });

  it('says the API was slow for a timeout', () => {
    expect(describeError(new ApiError('timeout', 'x'))).toMatch(/too long/);
  });

  it('names the status for an http error', () => {
    expect(describeError(new ApiError('http', 'x', { status: 500 }))).toMatch(/HTTP 500/);
  });

  it('asks the user to wait for a 429', () => {
    expect(describeError(new ApiError('http', 'x', { status: 429 }))).toMatch(/Too many requests/);
  });

  it('says the data was not understood for an invalid response', () => {
    expect(describeError(new ApiError('invalid', 'x'))).toMatch(/does not understand/);
  });

  it('falls back to a general message for anything else', () => {
    expect(describeError(new Error('boom'))).toMatch(/unexpected/);
  });
});
