import axios from "axios";
import { EmailMessage, SyncResponse, SyncUpdatedResponse } from "./types";

export class Account {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async startSync() {
    const response = await axios.post<SyncResponse>(`https://api.aurinko.io/v1/email/sync`, {}, {
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      params: {
        daysWithin: 2,
        bodyType: 'html'
      }
    })

    return response.data;
  }

  async performInitialSync() {
    // Perform initial sync
    try {
      let syncResponse = await this.startSync();

      while (!syncResponse.ready) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        syncResponse = await this.startSync();
      }

      // fetch the bookmark delta token
      let deltaToken: string = syncResponse.syncUpdatedToken;
      let updatedResponse = await this.getUpdatedEmails({ deltaToken });

      if (updatedResponse.nextDeltaToken) {
        // Sync completed
        deltaToken = updatedResponse.nextDeltaToken;
      }

      let allEmails: EmailMessage[] = updatedResponse.records;

      while (updatedResponse.nextPageToken) {
        updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken });

        allEmails = allEmails.concat(updatedResponse.records);

        if (updatedResponse.nextPageToken) {
          // Sync completed
          deltaToken = updatedResponse.nextDeltaToken;
        }
      }

      console.log('Initial sync completed, total emails:', allEmails.length);

      // store the delta token for future syncs
      return {
        emails: allEmails,
        deltaToken
      }

    } catch (error) {
      if (axios.isAxiosError(error))
        console.error('Error during sync: ', JSON.stringify(error.response?.data, null, 2));
      else
        console.error('Error during sync: ', error);
    }
  }

  async getUpdatedEmails({ deltaToken, pageToken }: { deltaToken?: string, pageToken?: string }) {
    let params: Record<string, string> = {};

    if (deltaToken) params.deltaToken = deltaToken;
    if (pageToken) params.pageToken = pageToken;

    const response = await axios.get<SyncUpdatedResponse>(`https://api.aurinko.io/v1/email/sync/updated`, {
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      params
    })

    return response.data;
  }

}