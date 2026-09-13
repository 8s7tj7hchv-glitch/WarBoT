import { WalletManager } from './WalletManager.js';
import { BankManager } from './BankManager.js';
import { TransactionManager } from './TransactionManager.js';

function money(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.round(number * 100) / 100;
}

export class EconomyService {
  constructor({ wallet, bank, transactions } = {}) {
    this.wallet = wallet ?? new WalletManager();
    this.bank = bank ?? new BankManager(undefined, this.wallet);
    this.transactions = transactions ?? new TransactionManager();
  }

  ensureAccount(userId) {
    this.wallet.getBalance(userId);
    this.bank.getBalance(userId);
  }

  balances(userId) {
    this.ensureAccount(userId);
    const wallet = this.wallet.getBalance(userId);
    const bank = this.bank.getBalance(userId);

    return {
      wallet,
      bank,
      total: money(wallet + bank)
    };
  }

  deposit(userId, amount) {
    const value = money(amount);
    if (value <= 0) return [false, 'Valor inválido.'];

    if (!this.bank.deposit(userId, value)) {
      return [false, 'Saldo insuficiente na carteira.'];
    }

    this.transactions.register({
      type: 'deposit',
      amount: value,
      userId,
      description: 'Depósito bancário'
    });

    return [true, 'Depósito realizado.'];
  }

  withdraw(userId, amount) {
    const value = money(amount);
    if (value <= 0) return [false, 'Valor inválido.'];

    if (!this.bank.withdraw(userId, value)) {
      return [false, 'Saldo bancário insuficiente.'];
    }

    this.transactions.register({
      type: 'withdraw',
      amount: value,
      userId,
      description: 'Saque bancário'
    });

    return [true, 'Saque realizado.'];
  }

  transfer(senderId, targetId, amount) {
    const sender = String(senderId);
    const target = String(targetId);
    const value = money(amount);

    if (sender === target) {
      return [false, 'Você não pode transferir dinheiro para si mesmo.'];
    }

    if (value <= 0) return [false, 'Valor inválido.'];

    this.ensureAccount(sender);
    this.ensureAccount(target);

    if (!this.wallet.remove(sender, value)) {
      return [false, 'Saldo insuficiente.'];
    }

    try {
      this.wallet.add(target, value);
    } catch (error) {
      this.wallet.add(sender, value);
      throw error;
    }

    this.transactions.register({
      type: 'transfer',
      amount: value,
      userId: sender,
      targetId: target,
      description: 'Transferência entre jogadores'
    });

    return [true, 'Transferência realizada.'];
  }

  // Fachada útil para módulos futuros do mercado.
  getBalance(userId) { return this.wallet.getBalance(userId); }
  add(userId, amount) { return this.wallet.add(userId, amount); }
  remove(userId, amount) { return this.wallet.remove(userId, amount); }
  get_balance(userId) { return this.getBalance(userId); }
  ensure_account(userId) { return this.ensureAccount(userId); }
}
