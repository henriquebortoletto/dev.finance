const Modal = {
  element: document.querySelector(".modal-overlay"),

  open() {
    Modal.element.classList.add("active")
  },
  close() {
    Modal.element.classList.remove("active")
  },
  init() {
    document.querySelector(".button.new").addEventListener("click", () => {
      Modal.open()
    })
    document.querySelector(".button.cancel").addEventListener("click", () => {
      Modal.close()
    })
  },
}

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')
    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  },
  formatAmount(value) {
    return Number(value.replace(/\,\./g, '')) * 100
  },
  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
  },
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },
  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },
  incomes() {
    let income = 0
    Transaction.all.forEach(({ amount }) => {
      if (amount > 0) {
        income += amount
      }
    })
    return income
  },
  expense() {
    let expense = 0
    Transaction.all.forEach(({ amount }) => {
      if (amount < 0) {
        expense += amount
      }
    })
    return expense
  },
  total() {
    return Transaction.incomes() + Transaction.expense()
  }
}

const Dom = {
  transactionContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = Dom.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index
    Dom.transactionContainer.appendChild(tr)
  },
  innerHTMLTransaction({ description, amount, date }, index) {
    const classCss = amount > 0 ? 'income' : 'expense' 
    const amountFormatted = Utils.formatCurrency(amount)

    return `
      <td class="description">${description}</td>
      <td class="${classCss}">${amountFormatted}</td>
      <td class="date">${date}</td>
      <td>
        <img src="./img/minus.svg" class="remove-transaction" alt="Remover transação" title="Remover Transação" onclick="Transaction.remove(${index})"/>
      </td>`
  },
  updateTransaction() {
    document.getElementById('income-display').innerHTML = Utils.formatCurrency(Transaction.incomes())
    document.getElementById('expense-display').innerHTML = Utils.formatCurrency(Transaction.expense())
    document.getElementById('total-display').innerHTML = Utils.formatCurrency(Transaction.total())
  },
  clearTransactions() {
    Dom.transactionContainer.innerHTML = ''
  }
}

const Form = {
  element: document.getElementById('form-submit'),
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },
  validateFields() {
    const { description, amount, date} = Form.getValues()

    if (description.trim() === '' || 
        amount.trim() === '' || 
        date.trim() === '') {
      throw new Error('Por favor, preencha todos os campos.')   
    }
  },
  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },
  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },
  submit() {
    Form.element.addEventListener('submit', event => {
      event.preventDefault()

      try {
        Form.validateFields()
        Transaction.add(Form.formatValues())
        Form.clearFields()
        Modal.close()
      } catch (error) {
        window.alert(error.message)
      }
    })
  }
}

const App = {
  init() {
    Modal.init()
    Form.submit()
    Transaction.all.forEach(Dom.addTransaction)
    Dom.updateTransaction()
    Storage.set(Transaction.all)
  },
  reload() {
    Dom.clearTransactions()
    App.init()
  },
}

App.init()