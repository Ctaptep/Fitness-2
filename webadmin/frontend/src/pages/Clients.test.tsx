process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.error('UNHANDLED REJECTION (top)', err);
});
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('UNCAUGHT EXCEPTION (top)', err);
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
try {
  require('./Clients');
  console.log('Clients импортирован без ошибок');
} catch (err) {
  console.error('FAIL: ошибка при импорте Clients', err);
}
import Clients from './Clients';
jest.mock('../api', () => ({
  __esModule: true,
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  del: jest.fn(),
  default: {}
}));
import { get, post, del } from '../api';
jest.mock('./TelegramMessageForm', () => () => <div data-testid="telegram-form-mock" />);
import { AxiosInstance } from 'axios';

describe('Clients page', () => {
  const clients = [
    { id: 1, username: 'user1', full_name: 'User One', email: 'u1@mail.com', is_premium: 0, is_active: 1 },
    { id: 2, username: 'user2', full_name: 'User Two', email: 'u2@mail.com', is_premium: 1, is_active: 1 },
  ];

  beforeEach(() => {
    window.confirm = jest.fn(() => true);
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
    delete window.location;
    window.location = { href: '', assign: jest.fn() } as any;
    console.log('beforeEach: window.confirm, localStorage, location mocked');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('mounts without crash', () => {
    (get as jest.Mock).mockResolvedValue({ data: clients });
    try {
      render(<Clients />);
    } catch (err) {
      console.error('FAIL: render crashed', err);
      throw err;
    }
  });

  // Глобальный перехват ошибок
  afterAll(() => {
    process.on('unhandledRejection', (err) => {
      // eslint-disable-next-line no-console
      console.error('UNHANDLED REJECTION', err);
    });
    process.on('uncaughtException', (err) => {
      // eslint-disable-next-line no-console
      console.error('UNCAUGHT EXCEPTION', err);
    });
  });

  it('renders clients table', async () => {
    try {
      (get as jest.Mock).mockResolvedValue({ data: clients });
      render(<Clients />);
      expect(await screen.findByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    } catch (err) {
      console.error('FAIL: renders clients table', err);
      throw err;
    }
  });

  it('filters clients by name', async () => {
    try {
      (get as jest.Mock).mockResolvedValue({ data: clients });
      render(<Clients />);
      expect(await screen.findByText('User One')).toBeInTheDocument();
      fireEvent.change(screen.getByPlaceholderText(/фильтр/i), { target: { value: 'Two' } });
      expect(screen.queryByText('User One')).not.toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    } catch (err) {
      console.error('FAIL: filters clients by name', err);
      throw err;
    }
  });

  it('can add a client', async () => {
    try {
      (post as jest.Mock).mockResolvedValueOnce({
        data: {
          id: 3,
          username: 'user3',
          full_name: 'User Three',
          email: 'u3@mail.com',
          is_premium: 0,
          is_active: 1,
        },
      });
      console.log('mocked post in can add a client');
      (get as jest.Mock).mockResolvedValueOnce({ data: clients })
        .mockResolvedValueOnce({
          data: [
            ...clients,
            {
              id: 3,
              username: 'user3',
              full_name: 'User Three',
              email: 'u3@mail.com',
              is_premium: 0,
              is_active: 1,
            },
          ],
        });
      console.log('mocked get in can add a client');
      render(<Clients />);
      console.log('rendered Clients in test');
      expect(await screen.findByText('User One')).toBeInTheDocument();

      fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user3' } });
      fireEvent.change(screen.getByPlaceholderText('Имя'), { target: { value: 'User Three' } });
      fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'u3@mail.com' } });

      fireEvent.click(screen.getByText('Добавить'));

      await waitFor(() => {
        expect(post).toHaveBeenCalled();
        expect(screen.getByText('User Three')).toBeInTheDocument();
      });
    } catch (err) {
      console.error('FAIL: can add a client', err);
      throw err;
    }
  });

  it('shows error if fields are empty', async () => {
    try {
      (get as jest.Mock).mockResolvedValueOnce({ data: clients });
      console.log('mocked get in shows error if fields are empty');
      render(<Clients />);
      console.log('rendered Clients in test');
      expect(await screen.findByText('User One')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Добавить'));
      expect(await screen.findByText(/заполните все поля/i)).toBeInTheDocument();
    } catch (err) {
      console.error('FAIL: shows error if fields are empty', err);
      throw err;
    }
  });

  it('can select and bulk delete clients', async () => {
    try {
      (del as jest.Mock).mockResolvedValue({});
      console.log('mocked del in can select and bulk delete clients');
      // initial fetch: оба клиента, после удаления: только второй
      (get as jest.Mock).mockResolvedValueOnce({ data: clients }) // initial fetch
        .mockResolvedValueOnce({ data: [clients[1]] }); // fetch after delete
      console.log('mocked get in can select and bulk delete clients');
      // Диагностика: выведем что вернул get после удаления
      // (можно добавить: console.log('get after delete', await get.mock.results[1].value);)

      render(<Clients />);
      console.log('rendered Clients in test');
      expect(await screen.findByText('User One')).toBeInTheDocument();

      // выбрать первого клиента (первый чекбокс после "выбрать все", обычно индекс 1)
      const checkboxes = screen.getAllByRole('checkbox');
      console.log('Checkboxes:', checkboxes);
      fireEvent.click(checkboxes[1]);

      fireEvent.click(screen.getByText('Удалить выбранных'));

      await waitFor(() => {
        expect(del).toHaveBeenCalled();
        expect(screen.queryByText('User One')).not.toBeInTheDocument();
      });
    } catch (err) {
      console.error('FAIL: can select and bulk delete clients', err);
      throw err;
    }
  });
});
