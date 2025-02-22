
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white/90 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <nav className="space-x-4">
            <Link to="/terms" className="text-blue-400 hover:text-blue-300">Terms & Conditions</Link>
            <Link to="/refund-policy" className="text-blue-400 hover:text-blue-300">Refund Policy</Link>
          </nav>
        </div>

        <div className="space-y-6">
          <section className="text-sm text-white/70">
            <p>Last Update: February 22, 2025</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">1. Introduction</h2>
            <div className="mt-4 space-y-4">
              <p>
                This Privacy Policy outlines how <span className="font-semibold">thumbnailslabs</span> ("the Company," "We," "Us," or "Our") handles your information when you use our AI-powered thumbnail generation tool and related services (collectively, the "Services"). It explains your privacy rights and how the law protects your data. By using <span className="font-semibold">thumbnailslabs</span>, you agree to the collection and use of your information as described in this policy.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">2. Definitions</h2>
            <div className="mt-4 space-y-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><span className="font-semibold">thumbnailslabs</span>: Refers to the entity providing AI-powered thumbnail generation and related services.</li>
                <li><span className="font-semibold">Tool</span>: The thumbnailslabs AI thumbnail generation tool, accessible through our platform.</li>
                <li><span className="font-semibold">User</span>: Any individual or entity utilizing the thumbnailslabs AI Tool.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">3. Types of Data Collected</h2>
            <div className="mt-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Personal Data</h3>
                  <p className="mb-2">While using our Tool, we may collect certain personally identifiable information ("Personal Data") that can be used to contact or identify you. This may include, but is not limited to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Email address</li>
                    <li>First and last name</li>
                    <li>Payment and billing information (where applicable)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Usage Data</h3>
                  <p className="mb-2">We automatically collect information regarding how the Tool is accessed and used. Usage Data may include:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Internet Protocol (IP) address</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and the time and date of the visit</li>
                    <li>Time spent on pages, unique device identifiers, and other diagnostic data</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Tracking Technologies & Cookies</h3>
                  <p>We use cookies and similar tracking technologies to monitor activity on our platform and hold certain information. You can control the use of cookies at the browser level. However, if you choose to disable cookies, it may affect your ability to use certain features of our Services.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">4. Use of Your Personal Data</h2>
            <div className="mt-4 space-y-4">
              <p>We use your Personal Data for various purposes, including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><span className="font-semibold">Service Provision</span>: To provide and maintain the Tool, facilitate subscriptions, and manage your account.</li>
                <li><span className="font-semibold">Service Improvements</span>: To analyze usage and enhance the features, functionality, and performance of our platform.</li>
                <li><span className="font-semibold">Communication</span>: To contact you with updates, newsletters, marketing, or promotional materials, and to respond to your inquiries or requests.</li>
                <li><span className="font-semibold">Security and Compliance</span>: To detect, prevent, and address technical or security issues, and to comply with legal obligations.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">5. Sharing Your Personal Data</h2>
            <div className="mt-4 space-y-4">
              <p>We may share your Personal Data under the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><span className="font-semibold">With Service Providers</span>: We engage third-party companies and individuals to facilitate our Services, provide the Service on our behalf, perform Service-related tasks, or assist us in analyzing how our Service is used.</li>
                <li><span className="font-semibold">For Business Transfers</span>: In the event of a merger, acquisition, or asset sale, your Personal Data may be transferred. We will provide notice if your Personal Data becomes subject to a different privacy policy.</li>
                <li><span className="font-semibold">With Affiliates</span>: We may share your information with our affiliates, including any parent companies, subsidiaries, or joint ventures.</li>
                <li><span className="font-semibold">With Business Partners</span>: We may share your information with our business partners to offer you certain products, services, or promotions.</li>
                <li><span className="font-semibold">With Other Users</span>: Any public interactions on our platform may be visible to other users and could be distributed outside the platform.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">6. Retention of Your Personal Data</h2>
            <div className="mt-4 space-y-4">
              <p>
                <span className="font-semibold">thumbnailslabs</span> will retain your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will also retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">7. Transfer of Your Personal Data</h2>
            <div className="mt-4 space-y-4">
              <p>
                Your information, including Personal Data, may be processed at <span className="font-semibold">thumbnailslabs'</span> operating offices or other locations where the parties involved in the processing are located. This may include transfers to computers outside of your state, province, or country where data protection laws may differ. We will take reasonable steps to ensure your data is treated securely in accordance with this Privacy Policy.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">8. Delete Your Personal Data</h2>
            <div className="mt-4 space-y-4">
              <p>
                You have the right to request the deletion of your Personal Data collected by <span className="font-semibold">thumbnailslabs</span>. You may update, amend, or delete your information at any time by contacting us at <span className="text-blue-400">support@thumbnailslabs.com</span>. However, certain data may be retained as required by law or for legitimate business purposes (e.g., compliance or security requirements).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">9. Disclosure of Your Personal Data</h2>
            <div className="mt-4 space-y-4">
              <p>We may disclose your Personal Data in certain circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><span className="font-semibold">Business Transactions</span>: If <span className="font-semibold">thumbnailslabs</span> is involved in a merger, acquisition, or asset sale, your Personal Data may be transferred.</li>
                <li><span className="font-semibold">Law Enforcement</span>: Under certain circumstances, we may be required to disclose your Personal Data if demanded by law or in response to valid requests by public authorities (e.g., a court or government agency).</li>
                <li>
                  <span className="font-semibold">Other Legal Requirements</span>: We may disclose your Personal Data when necessary to:
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>Comply with legal obligations</li>
                    <li>Protect and defend the rights or property of <span className="font-semibold">thumbnailslabs</span></li>
                    <li>Prevent or investigate wrongdoing related to the Service</li>
                    <li>Protect the personal safety of users or the public</li>
                    <li>Protect against legal liability</li>
                  </ul>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">10. Security of Your Personal Data</h2>
            <div className="mt-4 space-y-4">
              <p>
                We implement commercially reasonable measures to protect your Personal Data. However, no method of transmission over the internet or method of electronic storage is entirely secure. While we strive to use acceptable means to protect your Personal Data, we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400">11. Children's Privacy</h2>
            <div className="mt-4 space-y-4">
              <p>
                <span className="font-semibold">thumbnailslabs'</span> Services are not intended for individuals under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
              </p>
            </div>
          </section>
        </div>

        <footer className="text-center text-white/60 pt-8">
          <p>Last updated: February 22, 2025</p>
          <p>Contact: support@thumbnailslabs.com</p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;