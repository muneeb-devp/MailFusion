import { EmailAddress, EmailAttachment, EmailMessage } from "./types";
import { db } from "@/server/db";


export async function syncEmailsToDatabase(emails: EmailMessage[], accountId: string) {
  console.log('Attempting to sync emails to database');

  try {
    let emailIndex = 0;
    for (const email of emails) {
      await upsertEmail(email, accountId, emailIndex++);
    }
  } catch (error) {
    console.error('Error syncing emails to database', error);
  }
}

async function upsertEmail(email: EmailMessage, accountId: string, index: number) {
  console.log('Upserting email: ', index);
  try {
    let emailLabelType: 'inbox' | 'draft' | 'sent' = 'inbox';

    if (email.sysLabels.includes('inbox') || email.sysLabels.includes('important')) {
      emailLabelType = 'inbox';
    }
    else if (email.sysLabels.includes('draft')) {
      emailLabelType = 'draft';
    }
    else if (email.sysLabels.includes('sent')) {
      emailLabelType = 'sent';
    }

    const addressesToUpsert = new Map()
    for (const address of [email.from, ...email.to, ...email.cc, ...email.bcc, ...email.replyTo]) {
      addressesToUpsert.set(address.address, address);
    }

    const upsertedAddresses: (Awaited<ReturnType<typeof upsertEmailAddress>>)[] = []
    for (const address of addressesToUpsert.values()) {
      const upsertedAddress = await upsertEmailAddress(address, accountId)
      upsertedAddresses.push(upsertedAddress)
    }

    const addressMap = new Map(
      upsertedAddresses.filter(Boolean).map(address => [address!.address, address])
    )
    const fromAddress = addressMap.get(email.from.address)

    if (!fromAddress)
      throw new Error(`Failed to upsert from address for email: ${email.bodySnippet}`)

    const toAddress = email.to.map(addr => addressMap.get(addr.address)).filter(Boolean)
    const ccAddress = email.cc.map(addr => addressMap.get(addr.address)).filter(Boolean)
    const bccAddress = email.bcc.map(addr => addressMap.get(addr.address)).filter(Boolean)
    const replyToAddress = email.replyTo.map(addr => addressMap.get(addr.address)).filter(Boolean)

    // Upsert Thread
    const thread = await db.thread.upsert({
      where: { id: email.threadId },
      update: {
        accountId,
        subject: email.subject,
        lastMessageDate: new Date(email.sentAt),
        done: false,
        participantIds: [... new Set([
          fromAddress.id,
          ...toAddress.map(addr => addr?.id || ''),
          ...ccAddress.map(addr => addr?.id || ''),
          ...bccAddress.map(addr => addr?.id || ''),
        ])]
      },
      create: {
        accountId,
        id: email.threadId,
        subject: email.subject,
        lastMessageDate: new Date(email.sentAt),
        done: false,
        inboxStatus: emailLabelType === 'inbox',
        draftStatus: emailLabelType === 'draft',
        sentStatus: emailLabelType === 'sent',
        participantIds: [... new Set([
          fromAddress.id,
          ...toAddress.map(addr => addr?.id || ''),
          ...ccAddress.map(addr => addr?.id || ''),
          ...bccAddress.map(addr => addr?.id || ''),
        ])]
      }
    })

    // Upsert Email
    await db.email.upsert({
      where: { id: email.id },
      update: {
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { set: toAddress.map(a => ({ id: a!.id })) },
        cc: { set: ccAddress.map(a => ({ id: a!.id })) },
        bcc: { set: bccAddress.map(a => ({ id: a!.id })) },
        replyTo: { set: replyToAddress.map(a => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        internetHeaders: email.internetHeaders as any,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties: email.nativeProperties as any,
        folderId: email.folderId,
        omitted: email.omitted,
        emailLabel: emailLabelType,
      },
      create: {
        id: email.id,
        emailLabel: emailLabelType,
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        internetHeaders: email.internetHeaders as any,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { connect: toAddress.map(a => ({ id: a!.id })) },
        cc: { connect: ccAddress.map(a => ({ id: a!.id })) },
        bcc: { connect: bccAddress.map(a => ({ id: a!.id })) },
        replyTo: { connect: replyToAddress.map(a => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties: email.nativeProperties as any,
        folderId: email.folderId,
        omitted: email.omitted,
      }
    });


    const threadEmails = await db.email.findMany({
      where: { threadId: thread.id },
      orderBy: { receivedAt: 'asc' }
    });

    let threadFolderType = 'sent';
    for (const threadEmail of threadEmails) {
      if (threadEmail.emailLabel === 'inbox') {
        threadFolderType = 'inbox';
        break; // If any email is in inbox, the whole thread is in inbox
      } else if (threadEmail.emailLabel === 'draft') {
        threadFolderType = 'draft'; // Set to draft, but continue checking for inbox
      }
    }
    await db.thread.update({
      where: { id: thread.id },
      data: {
        draftStatus: threadFolderType === 'draft',
        inboxStatus: threadFolderType === 'inbox',
        sentStatus: threadFolderType === 'sent',
      }
    });

    // 4. Upsert Attachments
    for (const attachment of email.attachments) {
      await upsertAttachment(email.id, attachment);
    }

  } catch (error) {
    console.error('Error upserting email', error);

  }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
  try {
    const existingAccount = await db.emailAddress.findUnique({
      where: {
        accountId_address: {
          accountId,
          address: address.address ?? ""
        }
      }
    })

    if (existingAccount)
      return await db.emailAddress.update({
        where: { id: existingAccount.id },
        data: {
          name: address.name,
          raw: address.raw
        }
      })
    else
      return await db.emailAddress.create({
        data: {
          accountId,
          address: address.address ?? "",
          name: address.name,
          raw: address.raw
        }
      })
  } catch (error) {
    console.error('Error upserting email address', error);
  }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
  try {
    await db.emailAttachment.upsert({
      where: { id: attachment.id ?? "" },
      update: {
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
      create: {
        id: attachment.id,
        emailId,
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
    });
  } catch (error) {
    console.log(`Failed to upsert attachment for email ${emailId}: ${error}`);
  }
}