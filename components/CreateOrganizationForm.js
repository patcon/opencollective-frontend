import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Field, Form, Formik } from 'formik';
import { trim } from 'lodash';
import { withRouter } from 'next/router';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import slugify from 'slugify';

import { BackButton, messages } from './create-collective/CreateCollectiveForm';
import OnboardingProfileCard from './onboarding-modal/OnboardingProfileCard';
import CollectivePickerAsync from './CollectivePickerAsync';
import Container from './Container';
import { Box, Flex } from './Grid';
import MessageBox from './MessageBox';
import StyledButton from './StyledButton';
import StyledCheckbox from './StyledCheckbox';
import StyledHr from './StyledHr';
import StyledInput from './StyledInput';
import StyledInputField from './StyledInputField';
import StyledInputGroup from './StyledInputGroup';
import StyledLink from './StyledLink';
import StyledTextarea from './StyledTextarea';
import { H1, H4, P } from './Text';
import { withUser } from './UserProvider';

const orgMessages = defineMessages({
  nameLabel: { id: 'createOrg.form.nameLabel', defaultMessage: "What's the name of your organization?" },
  websiteLabel: { id: 'createOrg.form.webstiteLabel', defaultMessage: "What's your Organization's website" },
  suggestedLabel: { id: 'createOrg.form.suggestedLabel', defaultMessage: 'Suggested' },
  descriptionLabel: {
    id: 'createOrg.form.descriptionLabel',
    defaultMessage: 'What does your organization do?',
  },
  descriptionHint: {
    id: 'createOrg.form.descriptionHint',
    defaultMessage: 'Write a short description of your Organization (150 characters max)',
  },
  errorSlugHyphen: {
    id: 'createOrg.form.error.slug.hyphen',
    defaultMessage: 'Organization slug can not start nor end with hyphen',
  },
  errorWebsite: {
    id: 'createOrg.form.error.website',
    defaultMessage: 'Enter valid website format www.test.com or test.org',
  },
});

const placeholders = {
  name: { id: 'placeholder.name', defaultMessage: 'i.e. Salesforce, Airbnb' },
  slug: { id: 'placeholder.slug', defaultMessage: 'Airbnb' },
  description: { id: 'placeholderdescription', defaultMessage: 'Making a world a better place' },
  website: { id: 'placeholder.website', defaultMessage: 'www.airbnb.com' },
  username: { id: 'placeholder.username', defaultMessage: 'User name' },
};

function CreateOrganizationForm(props) {
  const { intl, error, loading, LoggedInUser, onSubmit, updateAdmins } = props;
  const [authorization, setAuthorization] = useState(false);
  const [admins, setAdmins] = useState([{ role: 'ADMIN', member: LoggedInUser.collective }]);
  const initialValues = {
    name: '',
    slug: '',
    description: '',
    website: '',
    coAdmin: '',
  };
  const validate = values => {
    const errors = {};

    if (values.name.length > 50) {
      errors.name = intl.formatMessage(messages.errorName);
    }
    if (values.slug.length > 30) {
      errors.slug = intl.formatMessage(messages.errorSlug);
    }
    if (values.slug !== trim(values.slug, '-')) {
      errors.slug = intl.formatMessage(orgMessages.errorSlugHyphen);
    }
    if (values.description.length > 150) {
      errors.description = intl.formatMessage(messages.errorDescription);
    }
    const regexExp = /[-a-zA-Z0-9@:%._/+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_/+.~#?&//=]*)?/gi;

    if (!values.website.match(new RegExp(regexExp)) || values.website.startsWith('http')) {
      errors.website = intl.formatMessage(orgMessages.errorWebsite);
    }
    return errors;
  };
  const submit = values => {
    const { name, slug, description, website } = values;
    onSubmit({ name, slug, description, website, authorization });
  };

  const removeAdmin = collective => {
    const filteredAdmins = admins.filter(admin => admin.member.id !== collective.id);
    setAdmins(filteredAdmins);
    updateAdmins(admins);
  };

  // Update admins whenever there is a change
  useEffect(() => {
    if (admins.length) {
      updateAdmins(admins);
    }
  }, [admins]);

  return (
    <Flex flexDirection="column">
      <Flex flexDirection="column" my={[0, 2]}>
        <Box>
          <BackButton asLink onClick={() => window && window.history.back()}>
            ←&nbsp;
            <FormattedMessage id="Back" defaultMessage="Back" />
          </BackButton>
        </Box>
        <Box mb={[2, 3]} alignItems="center">
          <H1
            width={[288, 264]}
            fontSize="28px"
            lineHeight="36px"
            fontWeight="500"
            textAlign={['left', 'center']}
            color="black.900"
            letterSpacing="1px"
            mt={1}
          >
            <FormattedMessage id="create.org.title" defaultMessage="Create Organization" />
          </H1>
        </Box>
      </Flex>
      {error && (
        <Flex alignItems="center" justifyContent="center">
          <MessageBox type="error" withIcon mb={[1, 3]} data-cy="cof-error-message">
            {error}
          </MessageBox>
        </Flex>
      )}
      <Formik validate={validate} initialValues={initialValues} onSubmit={submit} validateOnChange={true}>
        {formik => {
          const { values, handleSubmit, errors, touched, setFieldValue } = formik;
          const suggestedSlug = value => {
            const slugOptions = {
              replacement: '-',
              lower: true,
              strict: true,
            };
            return trim(slugify(value, slugOptions), '-');
          };
          const handleSlugChange = e => {
            if (!touched.slug) {
              setFieldValue('slug', suggestedSlug(e.target.value));
            }
          };
          return (
            <Form>
              <Container flexDirection="column" justifyContent="center" px={[1, 30, 100]} mt={4}>
                <Container display="flex" flexDirection={['column', 'row', 'row']}>
                  <Flex
                    flexDirection="column"
                    mx={[1, 10, 10]}
                    width={[320, 350, 376, 472]}
                    justifyContent="space-around"
                  >
                    <H4 color="black.900" fontSize="28px">
                      <FormattedMessage id="organization.info.headline" defaultMessage="Organization's information" />
                    </H4>
                    <StyledInputField
                      name="name"
                      htmlFor="name"
                      error={touched.name && errors.name}
                      label={intl.formatMessage(orgMessages.nameLabel)}
                      labelFontSize="13px"
                      labelColor="black.700"
                      fontSize="18px"
                      value={values.name}
                      onChange={handleSlugChange}
                      required
                      mt={3}
                      mb={3}
                      data-cy="cof-form-name"
                    >
                      {inputProps => (
                        <Field as={StyledInput} {...inputProps} placeholder={intl.formatMessage(placeholders.name)} />
                      )}
                    </StyledInputField>
                    <StyledInputField
                      name="slug"
                      htmlFor="slug"
                      error={touched.slug && errors.slug}
                      label={intl.formatMessage(messages.slugLabel)}
                      labelFontSize="13px"
                      labelColor="black.700"
                      fontSize="19px"
                      value={values.slug}
                      required
                      mt={3}
                      data-cy="cof-form-slug"
                    >
                      {inputProps => (
                        <Field
                          onChange={e => {
                            setFieldValue('slug', e.target.value);
                          }}
                          as={StyledInputGroup}
                          {...inputProps}
                          prepend="opencollective.com/"
                          placeholder={intl.formatMessage(placeholders.slug)}
                        />
                      )}
                    </StyledInputField>
                    {values.name.length > 0 && !touched.slug && (
                      <P fontSize="11px">{intl.formatMessage(messages.suggestedLabel)}</P>
                    )}
                    <StyledInputField
                      htmlFor="description"
                      error={touched.description && errors.description}
                      label={intl.formatMessage(orgMessages.descriptionLabel)}
                      labelFontSize="13px"
                      labelColor="black.700"
                      fontSize="13px"
                      required
                      mt={3}
                      data-cy="cof-org-description"
                    >
                      {inputProps => (
                        <Field
                          as={StyledTextarea}
                          onChange={e => {
                            setFieldValue('description', e.target.value);
                          }}
                          {...inputProps}
                          name="description"
                          minHeight={80}
                          maxHeight={80}
                          minLength={5}
                          maxLength={150}
                          width="100%"
                          value={values.description}
                          placeholder={intl.formatMessage(messages.descriptionPlaceholder)}
                        />
                      )}
                    </StyledInputField>
                    <P fontSize="11px">{intl.formatMessage(messages.descriptionHint)}</P>
                    <StyledInputField
                      name="website"
                      htmlFor="website"
                      error={touched.website && errors.website}
                      label={intl.formatMessage(orgMessages.websiteLabel)}
                      labelFontSize="13px"
                      labelColor="black.700"
                      value={values.website}
                      required
                      mt={3}
                      mb={2}
                      data-cy="ccf-org-website"
                    >
                      {inputProps => (
                        <Field
                          onChange={e => {
                            setFieldValue('website', e.target.value);
                          }}
                          color="red.400"
                          as={StyledInputGroup}
                          {...inputProps}
                          prepend="http://"
                          placeholder={intl.formatMessage(placeholders.website)}
                        />
                      )}
                    </StyledInputField>
                  </Flex>
                  <Flex flexDirection="column" width={[320, 350, 376, 472]} mx={[1, 10, 20]}>
                    <H4 color="black.900">
                      <FormattedMessage id="organization.coadmins.headline" defaultMessage="Administrators" />
                    </H4>
                    <P fontSize="14px" mb={2} lineHeight={2} color="black.700">
                      <FormattedMessage
                        id="coAdminsDescription"
                        defaultMessage="Organization admins can make changes in the profile and interact with other profiles on behalf of this organization."
                      />
                    </P>
                    <Container border="1px solid #E6E8EB" borderRadius="16px" p={3} height="auto">
                      <Flex flexDirection="row" alignItems="center" justifyContent="space-between">
                        <Flex fontSize="9px" mr={2} color="black.700" fontWeight="500">
                          <FormattedMessage id="inviteAdmin" defaultMessage="INVITE CO-ADMIN" />
                        </Flex>
                        <StyledHr flex="1" borderStyle="solid" borderColor="black.300" width={[100, 110, 120]} />
                      </Flex>
                      <Flex data-cy="org-profile-card" mt={2}>
                        {admins.length > 0 && (
                          <Flex width="100%" flexWrap="wrap">
                            {admins.map(admin => (
                              <OnboardingProfileCard
                                key={admin.member.id}
                                collective={admin.member}
                                adminCollective={LoggedInUser.collective}
                                removeAdmin={removeAdmin}
                              />
                            ))}
                          </Flex>
                        )}
                      </Flex>
                      <Flex flexDirection="row" alignItems="center" justifyContent="space-around" mt={4}>
                        <Flex fontSize="9px" mr={2} color="black.700" fontWeight="500">
                          <FormattedMessage id="inviteAdmin" defaultMessage="INVITE CO-ADMIN" />
                        </Flex>
                        <StyledHr flex="1" borderStyle="solid" borderColor="black.300" width={[100, 110, 120]} />
                      </Flex>
                      <CollectivePickerAsync
                        mt={2}
                        creatable
                        collective={null}
                        types={['USER']}
                        data-cy="admin-picker-org"
                        value="pp"
                        onChange={option => {
                          const duplicates = admins.filter(admin => admin.member.id === option.value.id);
                          setAdmins(duplicates.length ? admins : [...admins, { role: 'ADMIN', member: option.value }]);
                        }}
                        placeholder={intl.formatMessage(placeholders.username)}
                      />
                    </Container>
                  </Flex>
                </Container>

                <Flex flexDirection="column" my={4} mx={1} width={[320, 450]}>
                  <StyledCheckbox
                    name="authorization"
                    required
                    fontSize="12px"
                    label={
                      <FormattedMessage
                        id="createorganization.authorization.label"
                        defaultMessage="I verify that I am an authorized representative of this organization and 
                            have the right to act on its behalf."
                      />
                    }
                    onChange={({ checked }) => {
                      setAuthorization(checked);
                    }}
                  />
                  <Flex justifyContent={['center', 'left']} my={4}>
                    <StyledButton
                      fontSize="13px"
                      minWidth="148px"
                      minHeight="36px"
                      buttonStyle="primary"
                      type="submit"
                      loading={loading}
                      onSubmit={handleSubmit}
                      data-cy="cof-form-submit"
                    >
                      <FormattedMessage id="organization.create.button" defaultMessage="Create Organization" />
                    </StyledButton>
                  </Flex>

                  <Box textAlign="left" fontSize="12px" minHeight="24px" color="black.500">
                    <FormattedMessage
                      id="createOrganization.tos"
                      defaultMessage="By joining, you agree to our {tos} and {privacy}.
                          Already have an account?  {signinlink}"
                      values={{
                        signinlink: (
                          <StyledLink href="/signin" openInNewTab>
                            <FormattedMessage id="signinlink" defaultMessage="Sign in →" />
                          </StyledLink>
                        ),
                        tos: (
                          <strong>
                            <FormattedMessage
                              color="black.800"
                              id="collective.tos.label"
                              defaultMessage="Terms of Service"
                            />
                          </strong>
                        ),
                        privacy: (
                          <strong>
                            <FormattedMessage
                              color="black.800"
                              id="company.privacyPolicy"
                              defaultMessage="Privacy Policy"
                            />
                          </strong>
                        ),
                      }}
                    />
                  </Box>
                </Flex>
              </Container>
            </Form>
          );
        }}
      </Formik>
    </Flex>
  );
}

CreateOrganizationForm.propTypes = {
  collective: PropTypes.object,
  LoggedInUser: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onSubmit: PropTypes.func,
  updateAdmins: PropTypes.func,
  intl: PropTypes.object.isRequired,
};
export default injectIntl(withRouter(withUser(CreateOrganizationForm)));
