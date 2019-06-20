import React from 'react';
import { Box, Button, FormField, TextInput } from 'grommet';
import { LabelValuePair } from '../common/interfaces';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FundingRequest } from '../common/models/funding-request';
import SearchSelect from '../components/form/SearchSelect';
import { dateToString, extractDate } from '../common/formaters';

type FundingRequestFormProps = {
  onSubmit: (fundingRequest: FundingRequest) => void;
  onDiscard: () => void;
  contacts: LabelValuePair[];
  today: Date;
  fundingRequest: FundingRequest;
};

export default class FundingRequestForm extends React.Component<FundingRequestFormProps> {
  displayName = 'CreateEditInvoice';
  static defaultProps: FundingRequestFormProps = {
    onSubmit: (fundingRequest: FundingRequest) => {
      // do nothing by default
    },
    onDiscard: () => {
      // do nothing by default
    },
    today: new Date(),
    fundingRequest: new FundingRequest(),
    contacts: [],
  };

  state = { submitted: false };

  onSubmit = (values: FundingRequest) => {
    return this.props.onSubmit({ ...values });
  };

  onDiscard = () => {
    this.props.onDiscard();
  };


  render() {

    const { submitted } = this.state;
    const { fundingRequest, contacts, today } = this.props;
    const columnGap = 'medium';
    const sectionGap = 'large';


    const fundingRequestValidation = Yup.object().shape({
      funder: Yup.string()
        .required('This field is required'),
      repayment_amount: Yup.number()
        .required('This field is required')
        .max(fundingRequest.invoice_amount, 'Should not exceed the invoice amount'),
      apr: Yup.number()
        .required('This field is required'),
      fee: Yup.number()
        .required('This field is required'),
      repayment_due_date: Yup.date()
        .typeError('Wrong date format')
        .required('This field is required'),

    });

    return (
      <Box width={'800px'} pad={{ top: 'large', bottom: 'large' }}>
        <Formik
          validationSchema={fundingRequestValidation}
          initialValues={fundingRequest}
          validateOnBlur={submitted}
          validateOnChange={submitted}
          onSubmit={(values, { setSubmitting }) => {
            if (!values) return;
            this.onSubmit(values);
            setSubmitting(true);
          }}
        >
          {
            ({
               values,
               errors,
               handleChange,
               setFieldValue,
               handleSubmit,
             }) => {

              // Calculate days and repayment_amount
              let days, amount, financeRate, feeAmount, financeFee;
              const repaymentDate = new Date(values.repayment_due_date);
              const diff = repaymentDate.getTime() - today.getTime();
              days = Math.ceil(diff / (1000 * 60 * 60 * 24));
              financeRate = values.apr / 360 * days;
              feeAmount = values.fee * values.repayment_amount;
              financeFee = values.repayment_amount * financeRate + feeAmount;
              amount = values.repayment_amount - financeFee;

              if (isNaN(amount)) amount = 0;
              if (isNaN(days)) days = 0;
              values.days = days;
              values.amount = amount.toFixed(2);

              return (
                <form
                  onSubmit={event => {
                    this.setState({ submitted: true });
                    handleSubmit(event);
                  }}
                >
                  <Box direction="column" gap={sectionGap}>

                    <Box gap={columnGap}>
                      <Box direction="row" gap={columnGap}>
                        <Box basis={'1/2'} gap={columnGap}>
                          <FormField
                            label="Funder"
                            error={errors!.funder}
                          >
                            <SearchSelect
                              onChange={(item) => {
                                setFieldValue('funder', item.value);

                              }}
                              options={contacts}
                              selected={
                                contacts.find(
                                  contact =>
                                    contact.value === values!.funder,
                                )
                              }
                            />
                          </FormField>
                        </Box>

                        <Box basis={'1/2'} gap={columnGap} direction="row">
                          <Box basis={'1/2'}>
                            <FormField
                              label="Invoice amount"
                            >

                              <TextInput
                                disabled={true}
                                value={values.invoice_amount}
                              />
                            </FormField>
                          </Box>
                          <Box basis={'1/2'}>
                            <FormField
                              label="Currency"
                              error={errors!.currency}
                            >

                              <TextInput
                                disabled={true}
                                name="currency"
                                value={values!.currency}
                                onChange={handleChange}
                              />
                            </FormField>
                          </Box>
                        </Box>
                      </Box>

                    </Box>
                    <Box gap={columnGap}>
                      <Box direction="row" gap={columnGap}>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label={`Repayment amount, ${values!.currency}`}
                            error={errors!.repayment_amount}
                          >
                            <TextInput
                              name="repayment_amount"
                              value={values!.repayment_amount}
                              onChange={handleChange}
                            />
                          </FormField>
                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label="APR, %"
                            error={errors!.apr}
                          >
                            <TextInput
                              disabled={true}
                              name="apr"
                              value={values!.apr * 100}
                              onChange={handleChange}
                            />
                          </FormField>
                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label={`Finance fee, ${values!.currency}`}
                            error={errors!.fee}
                          >
                            <TextInput
                              disabled={true}
                              value={financeFee.toFixed(2)}
                            />
                          </FormField>
                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label={`Early payment amount, ${values!.currency}`}
                            error={errors!.amount}
                          >
                            <TextInput
                              disabled={true}
                              name="amount"
                              value={values!.amount}
                              onChange={handleChange}
                            />
                          </FormField>

                        </Box>
                      </Box>
                      <Box direction="row" gap={columnGap}>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label="Early payment date"
                            error={errors!.repayment_due_date}
                          >
                            <TextInput
                              disabled={true}
                              type="date"
                              value={extractDate(today)}

                            />
                          </FormField>
                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>
                          <FormField
                            label="Repayment due date"
                            error={errors!.repayment_due_date}
                          >
                            <TextInput
                              disabled={true}
                              name="repayment_due_date"
                              type="date"
                              value={extractDate(values!.repayment_due_date)}
                              onChange={ev => {
                                setFieldValue('repayment_due_date', dateToString(ev.target.value));
                              }}
                            />
                          </FormField>

                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>

                        </Box>
                        <Box basis={'1/4'} gap={columnGap}>

                        </Box>
                      </Box>
                    </Box>

                  </Box>
                  <Box direction="row" justify={'end'} gap="medium" margin={{ top: 'medium' }}>
                    <Button
                      onClick={this.onDiscard}
                      label="Discard"
                    />

                    <Button
                      type="submit"
                      primary
                      label="Request"
                    />
                  </Box>
                </form>
              );
            }
          }
        </Formik>
      </Box>
    );

  }
}


