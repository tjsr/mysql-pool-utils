// import { ErrnoException } from 'node:os';
import { QueryError } from 'mysql2';
import { errMessageOrCodeMessage } from './errorUtils.js';

const errorWithCode: QueryError = {
  code: 'ERROR_CODE',
  fatal: true,
  message: 'Error message here',
  name: 'ErrorWithCode',
};

const errorWithoutCode: Partial<QueryError> = {
  fatal: true,
  message: 'No Code Error message here',
  name: 'ErrorWithoutCode',
};

const errorCodeWithEmptyMessage: QueryError = { // NodeJS.ErrnoException = {
  code: 'ERROR_CODE',
  fatal: true,
  message: '',
  name: 'ErrorWithEmptyMessage',
};

describe('errorUtils', () => {
  test('Should give a string with the code in brackets when one is provided', () => {
    expect(errMessageOrCodeMessage(errorWithCode)).toEqual('[ERROR_CODE] Error message here');
  });

  test('Should give a string with the message when no code is provided', () => {
    expect(errMessageOrCodeMessage(errorWithoutCode as QueryError)).toEqual('No Code Error message here');
  });

  test('Should give a string with the code in brackets when one is provided and the message is empty', () => {
    expect(errMessageOrCodeMessage(errorCodeWithEmptyMessage)).toEqual('[ERROR_CODE]');
  });
});
