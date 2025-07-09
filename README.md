
# Britto Extractor

**Britto Extractor** is a powerful and lightweight browser extension for extracting data from Facebook. It helps users collect Facebook **profiles**, **groups**, and **pages** — including their names and links — directly from the **news feed** or **search results**. Ideal for marketers, researchers, or anyone doing targeted data collection on Facebook.

---


## 🚀 Features

- 🔍 Extract **Profiles**, **Groups**, and **Pages** from Facebook search results or feed.
- 📂 Create and manage multiple **Data Sets**.
- ♻️ Append multiple search results to a single data set (no duplicates).
- 📋 Copy all extracted results easily (with instant feedback).
- 🔁 Instantly reset a specific data set (with success message and table reload).
- 🧠 Persistent storage using local browser storage (no account or server required).
- 🖥️ Modern, tabbed popup UI with table view for easy browsing and copying.
- 🔗 **Download as CSV:** In the **Data Set** tab, click the link button to go to a page where you can download your data as a CSV file.



## 📌 Example Use Case

Suppose you're researching schools in Rangpur:

1. Create a data set named `Rangpur Schools` in the extension.
2. Search for schools on Facebook.
3. Select the data set `Rangpur Schools` and click **Extract**.
4. Repeat the search and extraction process as needed (all results are appended, no duplicates).

5. Open the **Data Set** tab in the popup to view all collected data as a table.

6. Use the **Copy Data** button for instant clipboard copy (with success message).
7. Use **Reset Data** to instantly clear the data set (with success message and table reload).
8. Click the **link** button in the Data Set tab to be redirected to a page where you can download your data as a CSV file.
8. Click the **CSV link button** in the Data Set tab to go to a page where you can download your data as a CSV file.

---

## 🧩 Installation

> ⚠️ Britto Extractor is a browser extension. Installation is manual for now.

### ✅ For Chrome (Manual Installation):

1. Download or clone this repository.
2. Go to `chrome://extensions/` in your Chrome browser.
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked** and select the folder where the extension is stored.
5. The Britto Extractor icon will appear in the extensions bar.

---

## 🧠 How It Works

- The extension scans the Facebook DOM for relevant data (names and links).
- The user selects a **Data Set** before extraction.
- On clicking **Extract**, the matched data is saved under that Data Set.
- From the **All Data Sets** section:
  - You can view all stored data.
  - You can copy it to clipboard.
  - You can reset a data set's content.

---

## 🛠 Tech Stack

- HTML / CSS / JavaScript
- Chrome Extension APIs
- LocalStorage (for saving data)

---

## ✅ Best Practices

- Use descriptive names for Data Sets to stay organized.
- Regularly back up or copy your data.
- Clear/reset a data set only when you're sure the data is no longer needed.

---

## 🙋‍♂️ Author

**Touhidul Islam**

- [GitHub](https://github.com/touhidul7)  
- [Portfolio](https://touhidul.vercel.app)  
- [Facebook](https://www.facebook.com/touhidul5700)  

---

## ⚠️ Disclaimer

This tool is created for personal, and productivity use.  
It is **not affiliated with, endorsed by, or associated with Facebook** in any way.  
Use it responsibly and ensure compliance with Facebook's terms of service and policies.