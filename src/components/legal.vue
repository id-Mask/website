<script setup>
import { ref } from 'vue'

const torModal = ref(false)
const ppModal = ref(false)
const imprintModal = ref(false)
const contactsModal = ref(false)

</script>

<template>
  <n-space justify="center" style="text-align: center;" vertical>
    <n-text style="font-size: 90%" depth="3">
      © {{ new Date().getFullYear() }} Ethenticator, Inc.. All rights reserved.
    </n-text>

    <div>
      <n-button size="tiny" quaternary @click="torModal = true">Terms of Service</n-button>
      <n-button size="tiny" quaternary @click="ppModal = true">Privacy Policy</n-button>
    </div>
    <div>
      <!-- <n-button size="tiny" quaternary @click="imprintModal = true">Imprint</n-button> -->
      <n-button size="tiny" quaternary @click="contactsModal = true">Contacts</n-button>
    </div>
  </n-space>

  <n-modal v-model:show="torModal">
    <n-card
      style="width: 80%;"
      title="Terms of Service"
      size="huge" 
      :bordered="true"
      :segmented="{ content: 'soft'}"
    >
    <n-scrollbar style="max-height: 80vh;">
    <n-text depth="3" style="font-size: 10px;">
      <p>
      Introduction
      </p>
      <p>
          Welcome to id-mask, the privacy-preserving tool for private data
          verification, allowing users to generate and selectively prove their
          personal data without disclosing personal privacy details to id-mask or
          third parties. These Terms &amp; Conditions (the “Terms”) govern access to
          and the use of ethenticator.io / ethenticator.com (the “Website”) and
          related services offered by Ethenticator, Inc. / id-mask (the “Services”).
      </p>
      <p>
          By accessing or using the Website or Services, the user acknowledges that
          they have read, understood, and agreed to be bound by these Terms and any
          additional terms and conditions and policies referenced herein or made
          available by Ethenticator, Inc. / id-mask in connection with the Website or
          Services. If the user disagrees with these Terms, they should not access or
          use the Website or Services.
      </p>
      <ol>
          <li>
              <p>
                  <b>User data and Blockchain</b>: No user data is stored or collected. Users
                  generate their own zero-knowledge proofs and are responsible for
                  storing and managing their own data. The zero-knowledge proof is
                  generated only on the client’s site. However, after the proof
                  generation, it can be additionally stored on-chain. Users agree
                  that, due to the nature of blockchain technology and the Mina
                  Protocol, once data is brought onto the blockchain as part of the
                  proof storage process, it cannot be deleted from the blockchain.
                  Users also acknowledge that this characteristic is inherent to
                  blockchain technology and is beyond the control of Ethenticator,
                  Inc. / id-mask.
              </p>
          </li>
          <li>
              <p>
                  <b>Terms and Services</b>: This agreement governs the use of the Website
                  and all services provided by the Website. By using the Website, the
                  user agrees to be bound by the terms and conditions outlined in this
                  agreement.
              </p>
          </li>
          <li>
              <p>
                  <b>Agreement between User and Ethenticator, Inc. / id-mask</b>: This
                  agreement constitutes a legally binding agreement between the user
                  and the Website. The user must read, agree with and accept all of
                  the terms and conditions contained in this agreement in order to use
                  the Website and its Services.
              </p>
          </li>
          <li>
              <p>
                  <b>Privacy</b>: The Website respects the privacy of its users and embeds
                  this securely in its service. The Website does not collect, store,
                  or sell personal information. All user data is saved only by the
                  user and used in the generation of the zero-knowledge proofs. We
                  have a separate Privacy Policy that describes our practices related
                  to the data collecting, using, and disclosing information in
                  connection with the Website and Services. Please review our Privacy
                  Policy carefully to understand our policies and practices.
              </p>
          </li>
          <li>
              <p>
                  <b>User Responsibilities</b>:
              </p>
          </li>
          <ol>
              <li>
                  <p>
                      Users are responsible for maintaining the confidentiality of
                      their personal data while accessing the Website through their
                      computer. Users agree to accept responsibility for all
                      activities that occur on their devices while interacting with
                      the Website.
                  </p>
              </li>
              <li>
                  <p>
                      The Website is not intended for children under thirteen years of
                      age. By using the Website, the user represents that they are at
                      least thirteen years of age.
                  </p>
              </li>
              <li>
                  <p>
                      The Website may contain links to third-party Websites or
                      services. The user should review the terms of use and privacy
                      policies of these third-party sites before using them.
                  </p>
              </li>
              <li>
                  <p>
                      The Website’s Services are intended for global use. However,
                      users understand that the services may be subject to legal
                      requirements that vary by region, and they undertake the
                      responsibility to ensure that their use of the services is in
                      accordance with the laws and regulations of their country of
                      origin.
                  </p>
              </li>
          </ol>
          <li>
              <p>
                  <b>User Conduct</b>: The user is solely responsible for the use of the
                  Website and Services, including any content, data, or information
                  they access or generate through the Website or Services. The user
                  agrees not to use the Website or Services for any unlawful or
                  prohibited purpose such as
              </p>
          </li>
          <ol>
              <li>
                  <p>
                      Impersonate any person or entity, or falsely state or otherwise
                      misrepresent your affiliation with any person or entity.
                  </p>
              </li>
              <li>
                  <p>
                      Interfere with or disrupt the Website or Services or servers or
                      networks connected to the Website or Services, or disobey any
                      requirements, procedures, policies, or regulations of networks
                      connected to the Website or Services.
                  </p>
              </li>
              <li>
                  <p>
                      Attempt to gain unauthorized access to any portion of the
                      Website or Services, other accounts, computer systems or
                      networks connected to the Website or Services, or any other
                      systems or networks.
                  </p>
              </li>
              <li>
                  <p>
                      Engage in any conduct that could damage, disable, overburden, or
                      impair the Website or Services or interfere with any Third
                      Party’s use and enjoyment.
                  </p>
              </li>
          </ol>
          <li>
              <p>
                  <b>Data Processing Agreement and Transparency</b>:
              </p>
          </li>
          <ol>
              <li>
                  <p>
                      Smart-ID is considered to be the Data Controller and id-mask is
                      considered to be the Data Processor.
                  </p>
              </li>
              <li>
                  <p>
                      Data initially is only stored on Smart-ID servers. On-route it
                      goes through the Zk-Oracle, the Data Processor, for the only
                      purpose of user data verification. The Zk-Oracle-Server is the
                      only external server where personal data is being processed. No
                      local data storage is in use in any Services of the Website.
                  </p>
              </li>
              <li>
                  <p>
                      Ethenticator, Inc. / id-mask is not informed about a user’s
                      attempt to generate a proof on their behalf. Everything that is
                      visible to Ethenticator, Inc. / id-mask technology-wise are the
                      Google Cloud logs, which contain metadata such as IP-information
                      but no personal data or information. A user’s attempt to
                      generate a proof of their personal data is not traceable to
                      their government-issued identity.
                  </p>
              </li>
              <li>
                  <p>
                      Please refer to our Privacy Policy for more details on how user
                      data is handled within the Website's services, excluding data
                      handled by Smart-ID.
                  </p>
              </li>
          </ol>
          <li>
              <p>
                  <b>Smart-ID Integration</b>:
              </p>
          </li>
          <ol>
              <li>
                  <p>
                      Any information that is stored with the external service of
                      Smart-ID must be in compliance with Smart-ID's terms of
                      services. Users are responsible for familiarizing themselves
                      with and adhering to Smart-ID's terms of services.
                  </p>
              </li>
              <li>
                  <p>
                      The Website disclaims any responsibility for the handling of
                      user data by Smart-ID. Users understand that the use of Smart-ID
                      is subject to Smart-ID's own terms, policies, and practices, and
                      any issues or concerns related to Smart-ID's services should be
                      directed to Smart-ID.
                  </p>
              </li>
              <li>
                  <p>
                      Ethenticator, Inc. / id-mask relies on Smart-ID as a third-party
                      service and is not able to identify and combat identity theft
                      that has already occurred in Smart-ID. It assumes that Smart-ID
                      fulfills its service to the fullest and that only true
                      identities of their true identity-holder are transferred to
                      Ethenticator, Inc. / id-mask.
                  </p>
              </li>
          </ol>
          <li>
              <p>
                  <b>Intellectual Property</b>: The Website and Services, including all
                  content, software, and technology provided, are owned by or licensed
                  to Ethenticator, Inc. / id-mask and are protected by applicable
                  copyright, trademark, patent, trade secret, and other intellectual
                  property laws. Users are granted a limited, non-exclusive,
                  non-transferable, revocable license to access and use the Website
                  and Services for personal use only.
              </p>
          </li>
          <li>
              <p>
                  <b>Zk-Apps</b>: The Website may use Zk-Apps in some of its services. The
                  user agrees to be bound by the terms of any Zk-App they use.
              </p>
          </li>
          <li>
              <p>
                  <b>Indemnification</b>: The user agrees to indemnify and hold the Website
                  and its affiliates harmless from any claims or damages arising from
                  the use of the Website’s services.
              </p>
          </li>
          <li>
              <p>
                  <b>Liability Disclaimer</b>: The Website and its Services are provided on
                  an "as is" and "as available" basis. The Website makes no warranties
                  of any kind, express or implied. In no event shall Ethenticator,
                  Inc. / id-mask or its affiliates be liable for any damages arising
                  out of or in connection with the use or inability to use the Website
                  or the generated proofs.
              </p>
          </li>
          <li>
              <p>
                  <b>Termination/Access Restriction</b>: The Website reserves the right to
                  terminate the user's access to the Website’s Services at any time
                  for any reason. Ethenticator, Inc. / id-mask may terminate a user’s
                  use of our website at any time, without prior notice, for any
                  reason. For example, users who provide personal data that is listed
                  on the OFAC sanctions list will not be able to generate a proof of
                  “Non-Sanctions” via Ethenticator, Inc. / id-mask.
              </p>
          </li>
          <li>
              <p>
                <b>Electronic Communications</b>: By using the Website, the user consents
                  to receiving electronic communications from the Website. These
                  communications may include notices about the user's account, updates
                  to the Website’s Services, and promotional materials.
              </p>
          </li>
          <li>
              <p>
                <b>Governing Law</b>: These terms and conditions shall be governed by and
                  construed in accordance with the laws of the state of Delaware,
                  United States. Any legal action or proceeding arising out of or
                  relating to these terms shall be brought exclusively in the state or
                  federal courts located in the state of Delaware.
              </p>
          </li>
          <li>
              <p>
                <b>Modification of terms</b>: Ethenticator, Inc. reserves the right to
                  modify these terms and conditions at any time, without prior notice.
                  The user’s continued use of our website constitutes your acceptance
                  of the modified terms and conditions.
              </p>
          </li>
          <li>
              <p>
                <b>Language</b>: Ethenticator, Inc. / id-mask does not warrant the
                  accuracy, completeness, or reliability of any translations, and
                  users agree that in case of any discrepancies, the English version
                  shall govern.
              </p>
          </li>
          <li>
              <p>
                <b>Applicable Law/Jurisdiction and Venue</b>: These terms and conditions,
                  and any disputes arising from or relating to the use of the Website
                  and Services, shall be governed by and construed in accordance with
                  the laws of the state of Delaware, United States, without regard to
                  its conflict of law principles. Any legal action or proceeding
                  arising out of or relating to these terms shall be brought
                  exclusively in the state or federal courts located in the state of
                  Delaware, and the parties consent to the personal jurisdiction of
                  these courts. The user agrees that any cause of action arising out
                  of or related to the Website or Services must commence within one
                  (1) year after the cause of action accrues. Otherwise, such cause of
                  action is permanently barred.
              </p>
          </li>
          <li>
              <p>
                <b>Contact information</b>: For general inquiries, users may contact
                  Ethenticator, Inc. / id-mask at any time by email at
                  maren@ethenticator.io. We strive to respond to inquiries promptly.
                  In urgent and important matters, users are encouraged to reach out
                  to our registered agent. The registered agent can be contacted at
                  251 Little Falls Drive, Wilmington, DE USA 19808. Please include
                  "URGENT" in the subject line for expedited attention. Users
                  acknowledge that communication via email carries certain risks,
                  including potential security risks. It is advisable not to include
                  sensitive or confidential information in email communications.
              </p>
          </li>
      </ol>
      </n-text>
    </n-scrollbar>
    </n-card>
  </n-modal>

  <n-modal v-model:show="ppModal">
    <n-card
      style="width: 80%;"
      title="Privacy Policy"
      size="huge" 
      :bordered="true"
      :segmented="{ content: 'soft'}"
    >
      <n-scrollbar style="max-height: 80vh;">
        <n-text depth="3" style="font-size: 10px;">
          <p>
              Welcome to id-mask, the privacy-preserving tool for private data
              verification, allowing users to generate and selectively prove their
              personal data without disclosing personal privacy details to id-mask or
              third parties. These Terms &amp; Conditions (the “Terms”) govern access to
              and the use of ethenticator.io / ethenticator.com (the “Website”) and
              related services offered by Ethenticator, Inc. / id-mask (the “Services”).
              This Privacy Policy describes how data is processed which is obtained
              through our websites id-mask.xyz, ethenticator.io and ethenticator.com.
          </p>
          <p>
              Information and Data
          </p>
          <p>
              This Website does not collect and store any personal data of users on any
              servers. All zero-knowledge-proofs and other cryptographic keys are
              generated locally by the users and stored on their devices. However, some
              information may be collected automatically when a user accesses and uses the
              Website, such as your IP address, browser type, operating system, and device
              information. This information is only used, if at all, for service improving
              purposes and is not evaluated individually.
          </p>
          <p>
              Information Sharing
          </p>
          <p>
              As no personal data is collected, it is not shared with any third-party
              service providers, affiliates, or business partners.
          </p>
          <p>
              Data Retention
          </p>
          <p>
              As no personal data is collected, no data is retained on our servers.
              However, server logs may be retained and other non-personal information for
              a limited period to analyze and improve the Website and Services.
          </p>
          <p>
              Security
          </p>
          <p>
              Reasonable measures and encryption takes place to protect the information
              provided by our users, including ensuring that the Website is secure. Users
              are responsible for protecting their cryptographic keys.
          </p>
          <p>
              User’s Choices
          </p>
          <p>
              As no personal data is collected, there are no choices to make regarding the
              use or disclosure of user’s information. However, cookies can be displayed
              or other tracking technologies in browser settings if the user does not want
              the browser to collect any non-personal information.
          </p>
          <p>
              Changes to this Policy
          </p>
          <p>
              This Privacy Policy may be updated from time to time. The Website users will
              be notified of significant changes via an pop-up notification on the
              website.
          </p>
          <p>
              The only stage of the process in which the responsibility over the
              zero-knowledge-proof is not assumed by the user only, is in case of an
              extraction on to and storage in the Inter Planetary File System (IPFS):
              Whenever the zero-knowledge-proof is uploaded to the IPFS database, it is
              sent and stored there. The zero-knowledge-proof itself does not contain any
              personal data and is additionally encrypted through the whole process of
              being sent to the IPFS database, stored and accessed from there. Inter
              Planetary File System is a decentralized protocol designed to create a
              peer-to-peer method of storing and sharing hypermedia in a distributed file
              system. While the encrypted zero-knowledge-proof is publicly accessible, it
              can only be used with the associated decryption key, which is stored in the
              Google and Apple Wallet Pass, which is only accessible to the user who is
              the owner of the zero-knowledge-proof in the first place.
          </p>
          <p>
              Contact
          </p>
          <p>
              If you have any questions or concerns about this Privacy Policy, don't
              hesitate to get in touch with us at maren@ethenticator.io.
          </p>
        </n-text>
      </n-scrollbar>
    </n-card>
  </n-modal>

  <n-modal v-model:show="imprintModal">
    <n-card
      style="width: 80%;"
      title="Imprint / Legal Notice"
      size="huge" 
      :bordered="true"
      :segmented="{ content: 'soft'}"
    >
      <n-scrollbar style="max-height: 80vh;">
        <n-text depth="3" style="font-size: 10px;">
          <p>
              Ethenticator, Inc.
          </p>
          <p>
              2991 Sacramento St, Unit #196, Berkeley, CA 94702
          </p>
          <p>
              Contact
          </p>
          <p>
              E-Mail: maren@ethenticator.io
          </p>
          <p>
              Internet address: ethenticator.io; ethenticator.com
          </p>
          <p>
              Website Owner:
          </p>
          <p>
              Id-mask is owned and operated by Ethenticator, Inc..
          </p>
          <p>
              Registered Agent:
          </p>
          <p>
              Corporation Service Company Global, 251 Little Falls Drive Wilmington, DE
              19808, New Castle County
          </p>
          <p>
              Disclaimer:
          </p>
          <p>
              Ethenticator, Inc. is a C corporation incorporated and operating under the
              laws of the United States. As a C corporation, we adhere to the legal and
              regulatory framework governing corporations in the jurisdiction of our
              incorporation.
          </p>
        </n-text>
      </n-scrollbar>
    </n-card>
  </n-modal>


  <n-modal v-model:show="contactsModal">
    <n-card
      style="width: 80%;"
      title="Contacts"
      size="huge" 
      :bordered="true"
      :segmented="{ content: 'soft'}"
    >
      <n-scrollbar style="max-height: 80vh;">
        <n-text depth="3" style="font-size: 10px;">
          Email: maren@ethenticator.io
        </n-text>
      </n-scrollbar>
    </n-card>
  </n-modal>

</template>

<style scoped>
</style>
