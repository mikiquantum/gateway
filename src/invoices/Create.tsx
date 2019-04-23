import React from 'react';

import { connect } from 'react-redux';

import InvoiceForm from './InvoiceForm';
import { createInvoice, resetCreateInvoice } from '../store/actions/invoices';
import { Invoice } from '../common/models/invoice';
import { RouteComponentProps, withRouter } from 'react-router';
import { RequestState } from '../store/reducers/http-request-reducer';
import { InvoiceInvoiceData } from '../../clients/centrifuge-node';
import { Contact } from '../common/models/contact';
import { getContacts, resetGetContacts } from '../store/actions/contacts';
import { LabelValuePair } from '../common/interfaces';
import routes from './routes';

type ConnectedCreateInvoiceProps = {
  createInvoice: (invoice: Invoice) => void;
  resetCreateInvoice: () => void;
  getContacts: () => void;
  resetGetContacts: () => void;
  creatingInvoice: boolean;
  contacts?: LabelValuePair[];
} & RouteComponentProps;

class ConnectedCreateInvoice extends React.Component<ConnectedCreateInvoiceProps> {

  componentDidMount() {
    if (!this.props.contacts) {
      this.props.getContacts();
    }
  }

  componentWillUnmount() {
    this.props.resetCreateInvoice();
    this.props.resetGetContacts();
  }

  createInvoice = (invoice: Invoice) => {
    this.props.createInvoice(invoice);
  };

  onCancel = () => {
    this.props.history.push(routes.index);
  };

  render() {

    if (!this.props.contacts) {
      return 'Loading';
    }

    if (this.props.creatingInvoice) {
      return 'Creating invoice';
    }

    return (
      <InvoiceForm
        onSubmit={this.createInvoice}
        onCancel={this.onCancel}
        contacts={this.props.contacts}
      />
    );
  }
}

export default connect(
  (state: {
    invoices: { create: RequestState<InvoiceInvoiceData> };
    contacts: { get: RequestState<Contact[]> };
  }) => {
    return {
      creatingInvoice: state.invoices.create.loading,
      contacts: state.contacts.get.data
        ? (state.contacts.get.data.map(contact => ({
          label: contact.name,
          value: contact.address,
        })) as LabelValuePair[])
        : undefined,
    };
  },
  { createInvoice, resetCreateInvoice, getContacts, resetGetContacts },
)(withRouter(ConnectedCreateInvoice));
