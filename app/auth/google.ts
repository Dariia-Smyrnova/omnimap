"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { google } from "googleapis";

export async function addContactToGoogle(name: string, phoneNumber: string) {
  const session = auth();
  const response = await clerkClient.users.getUserOauthAccessToken(session.userId!, 'oauth_google')
  const accessToken = response.data[0].token;
  console.log(response.data[0].scopes);
  
  const gauth = new google.auth.OAuth2(
    
  );
  gauth.setCredentials({ access_token: accessToken });

  const people = google.people({ version: 'v1', auth: gauth });

  const contact = {
    names: [{ givenName: name }],
    phoneNumbers: [{ value: phoneNumber }]
  };

  try {
    await people.people.createContact({ requestBody: contact });
    console.log(`Added contact: ${name} (${phoneNumber}) to Google Contacts`);
    return true;
  } catch (error) {
    console.error('Error adding contact to Google Contacts:', error);
    return false;
  }
}


export async function getAllGoogleContacts() {
  const session = auth();
  const response = await clerkClient.users.getUserOauthAccessToken(session.userId!, 'oauth_google')
  const accessToken = response.data[0].token;

  const gauth = new google.auth.OAuth2();
  gauth.setCredentials({ access_token: accessToken });

  const people = google.people({ version: 'v1', auth: gauth });

  try {
    const res = await people.people.connections.list({
      resourceName: 'people/me',
      personFields: 'names,phoneNumbers,emailAddresses',
      pageSize: 1000, // Adjust this value based on your needs
    });

    const contacts = res.data.connections || [];
    console.log("CONTACTS:", contacts);
    return contacts.map(contact => ({
      name: contact.names?.[0]?.displayName || '',
      phoneNumber: contact.phoneNumbers?.[0]?.value || '',
      email: contact.emailAddresses?.[0]?.value || '',
    }));
  } catch (error) {
    console.error('Error fetching Google Contacts:', error);
    return [];
  }
}
