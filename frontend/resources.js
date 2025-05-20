/**
 * NeuraScan Resources Section JavaScript
 * This file handles the implementation of the Resources section including
 * FAQ, Research Papers, and Documentation components.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Resources tab switching
    initializeResourcesTabs();
    
    // Initialize FAQ section with collapsible cards
    initializeFAQ();
    
    // Initialize Research Papers section
    initializeResearchPapers();
    
    // Initialize Documentation section
    initializeDocumentation();
});

/**
 * Initializes the tab switching functionality in the Resources section
 */
function initializeResourcesTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabs.length || !tabContents.length) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to the clicked tab
            tab.classList.add('active');
            
            // Show the corresponding content
            const contentId = tab.id.replace('-tab', '-content');
            document.getElementById(contentId).classList.add('active');
        });
    });
    
    // Update the footer links to point to the resources section tabs
    const openFaqLink = document.getElementById('open-faq');
    if (openFaqLink) {
        openFaqLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Scroll to the resources section
            document.getElementById('resources').scrollIntoView({ behavior: 'smooth' });
            
            // Activate the FAQ tab
            document.getElementById('faq-tab').click();
        });
    }
    
    // Update the Research Papers and Documentation links in the footer
    const researchPapersLink = document.querySelector('.footer-links a[href="#"]:nth-child(2)');
    if (researchPapersLink) {
        researchPapersLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Scroll to the resources section
            document.getElementById('resources').scrollIntoView({ behavior: 'smooth' });
            
            // Activate the Research Papers tab
            document.getElementById('research-tab').click();
        });
    }
    
    const documentationLink = document.querySelector('.footer-links a[href="#"]:nth-child(3)');
    if (documentationLink) {
        documentationLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Scroll to the resources section
            document.getElementById('resources').scrollIntoView({ behavior: 'smooth' });
            
            // Activate the Documentation tab
            document.getElementById('docs-tab').click();
        });
    }
}

/**
 * Initializes the FAQ section with collapsible cards
 */
function initializeFAQ() {
    const faqContainer = document.querySelector('.faq-container');
    if (!faqContainer) return;
    
    // FAQ data
    const faqItems = [
        {
            question: "What is NeuraScan?",
            answer: "NeuraScan is a deep learning-based brain tumor detection tool using MRI scans. It utilizes state-of-the-art neural networks to analyze medical images and identify potential tumors with high accuracy."
        },
        {
            question: "How accurate is the detection?",
            answer: "NeuraScan has a 96% detection accuracy rate based on Above 5,000 training images. While highly accurate, it is designed as a diagnostic aid and should be used alongside professional medical evaluation."
        },
        {
            question: "What types of brain tumors can the system detect?",
            answer: "NeuraScan can detect and classify several common types of brain tumors, including meningiomas, gliomas, pituitary tumors, and metastatic tumors. The system continues to learn and improve its detection capabilities."
        },
        {
            question: "What image formats are supported?",
            answer: "We support standard medical imaging formats as well as common formats like JPEG, PNG, and TIFF. All images are automatically processed to ensure optimal analysis."
        },
        {
            question: "Is my medical data secure?",
            answer: "Yes, we use industry-standard encryption and security practices to protect all data. We comply with HIPAA regulations in the US and GDPR in Europe. Your images and results are never shared without your explicit consent."
        },
        {
            question: "How long does it take to process an image?",
            answer: "Most scans are processed within 3-5 seconds, depending on the image size and complexity. Our cloud infrastructure is optimized to provide quick and reliable results for medical professionals."
        }
    ];
    
    // Create FAQ items
    faqItems.forEach(item => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        
        faqItem.innerHTML = `
            <div class="faq-question">
                ${item.question}
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
                <div class="faq-answer-content">
                    ${item.answer}
                </div>
            </div>
        `;
        
        faqContainer.appendChild(faqItem);
    });
    
    // Add click handlers for FAQ questions
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(question => {
        question.addEventListener('click', () => {
            const isActive = question.classList.contains('active');
            const answer = question.nextElementSibling;
            
            // Close all other questions first
            questions.forEach(q => {
                if (q !== question) {
                    q.classList.remove('active');
                    q.nextElementSibling.style.maxHeight = '0px';
                }
            });
            
            // Toggle active question
            if (isActive) {
                question.classList.remove('active');
                answer.style.maxHeight = '0px';
            } else {
                question.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

/**
 * Helper function to check if a file exists in Firebase Storage
 */
function checkFileExists(storage, path) {
    return new Promise((resolve, reject) => {
        const fileRef = storage.ref(path);
        
        // getMetadata() will succeed if the file exists, and fail if it doesn't
        fileRef.getMetadata()
            .then(() => {
                resolve(true); // File exists
            })
            .catch(error => {
                if (error.code === 'storage/object-not-found') {
                    resolve(false); // File doesn't exist
                } else {
                    reject(error); // Other error occurred
                }
            });
    });
}

/**
 * Initializes the Research Papers section with Firebase integration
 */
function initializeResearchPapers() {
    const papersContainer = document.querySelector('.papers-container');
    if (!papersContainer) return;
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        papersContainer.innerHTML = '<p class="error-message">Firebase is not available. Research papers cannot be loaded.</p>';
        return;
    }
    
    // Reference to Firebase Storage and Firestore
    const storage = firebase.storage();
    const db = firebase.firestore();
    
    // Show loading indicator
    papersContainer.innerHTML = '<p class="loading-papers">Loading research papers...</p>';
    
    // These are the expected files in Firebase Storage - exact names of files that exist
    const expectedFiles = [
        "Brain Tumor Detection Image Segmentation Using OpenCV.pdf",
        "Classification of Brain Tumors with Deep Learning Models.pdf",
        "Machine learning for brain tumor classification.pdf"
    ];
    
    // First, check if we already have papers in Firestore
    db.collection('researchPapers').get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log("No research papers found in Firestore, creating them now...");
                // No papers in Firestore yet, let's create them based on the actual files in Storage
                createSampleResearchPapers()
                    .then(() => {
                        console.log("Sample papers created successfully");
                        // Now fetch and display the created papers
                        fetchAndDisplayResearchPapers(papersContainer, storage, db);
                    })
                    .catch(error => {
                        console.error("Error creating sample papers:", error);
                        papersContainer.innerHTML = `<p class="error-message">Error loading research papers: ${error.message}</p>`;
                    });
            } else {
                // Check if the papers in Firestore match the expected files
                let needsUpdate = false;
                const existingRefs = new Set();
                
                snapshot.forEach(doc => {
                    const paper = doc.data();
                    // Check if the paper's fileRef is in the expected format
                    const fileName = paper.fileRef.split('/').pop();
                    existingRefs.add(fileName);
                });
                
                // Check if all expected files are in Firestore
                for (const file of expectedFiles) {
                    if (!existingRefs.has(file)) {
                        needsUpdate = true;
                        console.log(`Missing file in Firestore: ${file}`);
                        break;
                    }
                }
                
                if (needsUpdate) {
                    console.log("Research papers in Firestore don't match the expected files. Updating...");
                    // Delete existing papers and recreate them
                    const batch = db.batch();
                    snapshot.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    
                    batch.commit()
                        .then(() => {
                            console.log("Existing papers deleted, creating new ones...");
                            return createSampleResearchPapers();
                        })
                        .then(() => {
                            console.log("Papers updated successfully");
                            fetchAndDisplayResearchPapers(papersContainer, storage, db);
                        })
                        .catch(error => {
                            console.error("Error updating papers:", error);
                            papersContainer.innerHTML = `<p class="error-message">Error updating research papers: ${error.message}</p>`;
                        });
                } else {
                    console.log("Found existing research papers in Firestore that match expected files");
                    // We already have papers in Firestore, display them
                    fetchAndDisplayResearchPapers(papersContainer, storage, db);
                }
            }
        })
        .catch(error => {
            console.error("Error checking research papers:", error);
            papersContainer.innerHTML = `<p class="error-message">Error loading research papers: ${error.message}</p>`;
        });
}

/**
 * Fetches and displays research papers from Firestore
 */
function fetchAndDisplayResearchPapers(container, storage, db) {
    // Clear loading message
    container.innerHTML = '';
    
    db.collection('researchPapers').get()
        .then(snapshot => {
            if (snapshot.empty) {
                container.innerHTML = '<p>No research papers available yet.</p>';
                return;
            }
            
            // Create a paper card for each document
            snapshot.forEach(doc => {
                const paper = doc.data();
                const paperCard = document.createElement('div');
                paperCard.className = 'paper-card';
                
                paperCard.innerHTML = `
                    <div class="paper-img">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="paper-content">
                        <h3 class="paper-title">${paper.title}</h3>
                        <p class="paper-authors">${paper.authors}</p>
                        <p class="paper-description">${paper.description}</p>
                        <div class="paper-footer">
                            <span class="paper-date">${paper.date}</span>
                            <span class="paper-download" data-file="${paper.fileRef}">
                                View PDF <i class="fas fa-download"></i>
                            </span>
                        </div>
                    </div>
                `;
                
                // Add click handler for downloading/viewing the PDF
                paperCard.querySelector('.paper-download').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const fileRef = e.currentTarget.getAttribute('data-file');
                    
                    // Show loading indicator
                    const downloadText = e.currentTarget;
                    const originalText = downloadText.innerHTML;
                    downloadText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                    
                    console.log(`Attempting to retrieve file: ${fileRef}`);
                    
                    // First check if the file exists
                    checkFileExists(storage, fileRef)
                        .then(exists => {
                            if (exists) {
                                // File exists, get the download URL
                                return storage.ref(fileRef).getDownloadURL();
                            } else {
                                throw new Error(`File "${fileRef}" not found in Firebase Storage`);
                            }
                        })
                        .then(url => {
                            console.log(`Successfully retrieved download URL for ${fileRef}`);
                            // Open PDF in new tab
                            window.open(url, '_blank');
                            
                            // Restore original text
                            downloadText.innerHTML = originalText;
                        })
                        .catch(error => {
                            console.error(`Error getting download URL for ${fileRef}:`, error);
                            downloadText.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error loading file';
                            
                            // Show detailed error notification
                            const errorMessage = `Could not retrieve file: ${error.message}. Please make sure the file exists in Firebase Storage.`;
                            if (typeof showNotification === 'function') {
                                showNotification('Error', errorMessage, 'error', 5000);
                            } else {
                                console.error(errorMessage);
                                alert(errorMessage);
                            }
                            
                            // Restore original text after 3 seconds
                            setTimeout(() => {
                                downloadText.innerHTML = originalText;
                            }, 3000);
                        });
                });
                
                // Add click handler for the entire card
                paperCard.addEventListener('click', () => {
                    paperCard.querySelector('.paper-download').click();
                });
                
                container.appendChild(paperCard);
            });
        })
        .catch(error => {
            console.error("Error getting research papers:", error);
            container.innerHTML = `
                <p class="error-message">
                    <i class="fas fa-exclamation-triangle"></i> 
                    Error loading research papers: ${error.message}
                </p>
                <button class="btn" onclick="initializeResearchPapers()">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            `;
        });
}

/**
 * Creates sample research papers in Firestore
 */
function createSampleResearchPapers() {
    const db = firebase.firestore();
    const batch = db.batch();
    
    // Sample research papers with correct references to the existing files in Firebase Storage
    const samplePapers = [
        {
            title: "Brain Tumor Detection Image Segmentation Using OpenCV",
            authors: "Johnson, A., Smith, B., Williams, C.",
            description: "This paper presents an approach for brain tumor detection through image segmentation techniques using OpenCV, providing highly accurate results for medical professionals.",
            date: "May 11, 2025",
            fileRef: "research_papers/Brain Tumor Detection Image Segmentation Using OpenCV.pdf"
        },
        {
            title: "Classification of Brain Tumors with Deep Learning Models",
            authors: "Martinez, D., Chen, L., Anderson, P.",
            description: "A comprehensive study on various deep learning models for the classification of brain tumors, comparing performance and accuracy across multiple architectures.",
            date: "May 11, 2025",
            fileRef: "research_papers/Classification of Brain Tumors with Deep Learning Models.pdf"
        },
        {
            title: "Machine Learning for Brain Tumor Classification",
            authors: "Brown, R., Davis, M., Wilson, J.",
            description: "This research explores how machine learning techniques can significantly improve the accuracy and efficiency of brain tumor classification from MRI scans.",
            date: "May 11, 2025",
            fileRef: "research_papers/Machine learning for brain tumor classification.pdf"
        }
    ];
    
    // Add sample papers to batch
    samplePapers.forEach(paper => {
        const docRef = db.collection('researchPapers').doc();
        batch.set(docRef, paper);
    });
    
    // Commit the batch
    return batch.commit();
}

/**
 * Initializes the Documentation section with Firebase integration
 */
function initializeDocumentation() {
    const docsContainer = document.querySelector('.docs-container');
    if (!docsContainer) return;
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        docsContainer.innerHTML = '<p class="error-message">Firebase is not available. Documentation cannot be loaded.</p>';
        return;
    }
    
    // Reference to Firebase Storage and Firestore
    const storage = firebase.storage();
    const db = firebase.firestore();
    
    // Create documentation collection if it doesn't exist
    checkAndCreateCollection('documentation')
        .then(() => {
            // Fetch documentation from Firestore
            db.collection('documentation').get()
                .then(snapshot => {
                    if (snapshot.empty) {
                        // If no docs exist yet, add some sample docs
                        createSampleDocumentation()
                            .then(() => {
                                // Fetch again after creating samples
                                fetchAndDisplayDocumentation(docsContainer, storage, db);
                            });
                    } else {
                        // Display existing docs
                        fetchAndDisplayDocumentation(docsContainer, storage, db);
                    }
                })
                .catch(error => {
                    console.error("Error getting documentation:", error);
                    docsContainer.innerHTML = `<p class="error-message">Error loading documentation: ${error.message}</p>`;
                });
        })
        .catch(error => {
            console.error("Error checking or creating collection:", error);
            docsContainer.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        });
}

/**
 * Fetches and displays documentation from Firestore
 */
function fetchAndDisplayDocumentation(container, storage, db) {
    // Clear loading message
    container.innerHTML = '';
    
    db.collection('documentation').get()
        .then(snapshot => {
            if (snapshot.empty) {
                container.innerHTML = '<p>No documentation available yet.</p>';
                return;
            }
            
            snapshot.forEach(doc => {
                const docData = doc.data();
                const docCard = document.createElement('div');
                docCard.className = 'doc-card';
                
                docCard.innerHTML = `
                    <div class="doc-icon">
                        <i class="${docData.icon || 'fas fa-file-alt'}"></i>
                    </div>
                    <div class="doc-content">
                        <h3 class="doc-title">${docData.title}</h3>
                        <p class="doc-description">${docData.description}</p>
                    </div>
                    <div class="doc-download" data-file="${docData.fileRef}">
                        <i class="fas fa-download"></i>
                    </div>
                `;
                
                // Add click handler for downloading/viewing the PDF
                docCard.querySelector('.doc-download').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const fileRef = e.currentTarget.getAttribute('data-file');
                    
                    // Show loading indicator
                    const downloadEl = e.currentTarget;
                    const originalContent = downloadEl.innerHTML;
                    downloadEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    
                    // Get download URL from Firebase Storage
                    storage.ref(fileRef).getDownloadURL()
                        .then(url => {
                            // Open PDF in new tab
                            window.open(url, '_blank');
                            
                            // Restore original icon
                            downloadEl.innerHTML = originalContent;
                        })
                        .catch(error => {
                            console.error("Error getting download URL:", error);
                            downloadEl.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                            
                            // Restore original icon after 2 seconds
                            setTimeout(() => {
                                downloadEl.innerHTML = originalContent;
                            }, 2000);
                        });
                });
                
                // Add click handler for the entire card
                docCard.addEventListener('click', () => {
                    docCard.querySelector('.doc-download').click();
                });
                
                container.appendChild(docCard);
            });
        })
        .catch(error => {
            console.error("Error getting documentation:", error);
            container.innerHTML = `<p class="error-message">Error loading documentation: ${error.message}</p>`;
        });
}

/**
 * Creates sample documentation in Firestore
 */
function createSampleDocumentation() {
    const db = firebase.firestore();
    const batch = db.batch();
    
    // Sample documentation
    const sampleDocs = [
        {
            title: "NeuraScan User Guide",
            description: "Complete user guide for the NeuraScan brain tumor detection tool. Includes setup instructions, usage guides, and interpretation of results.",
            icon: "fas fa-book",
            fileRef: "documentation/neurascan_user_guide.pdf"
        },
        {
            title: "Technical Documentation",
            description: "Technical specifications and architecture details for developers and technical staff. Includes API documentation and integration guidelines.",
            icon: "fas fa-code",
            fileRef: "documentation/technical_documentation.pdf"
        },
        {
            title: "Clinical Validation Report",
            description: "Comprehensive report on the clinical validation studies conducted with NeuraScan, including accuracy metrics and comparison with expert diagnoses.",
            icon: "fas fa-file-medical",
            fileRef: "documentation/clinical_validation.pdf"
        },
        {
            title: "Installation Guide",
            description: "Step-by-step guide for installing and configuring NeuraScan in various healthcare IT environments.",
            icon: "fas fa-download",
            fileRef: "documentation/installation_guide.pdf"
        }
    ];
    
    // Add sample docs to batch
    sampleDocs.forEach(docData => {
        const docRef = db.collection('documentation').doc();
        batch.set(docRef, docData);
    });
    
    // Commit the batch
    return batch.commit();
}

/**
 * Checks if a collection exists and creates it if it doesn't
 */
function checkAndCreateCollection(collectionName) {
    return new Promise((resolve, reject) => {
        if (typeof firebase === 'undefined' || !firebase.apps.length) {
            reject(new Error('Firebase is not available'));
            return;
        }
        
        const db = firebase.firestore();
        
        // Check if collection exists
        db.collection(collectionName).get()
            .then(snapshot => {
                // Collection exists, no need to create it
                resolve();
            })
            .catch(error => {
                // If the error is because the collection doesn't exist, try to create it
                if (error.code === 'resource-exhausted') {
                    // Cannot programmatically create empty collections in Firestore
                    // We'll create a dummy document that can be deleted later
                    db.collection(collectionName).doc('dummy')
                        .set({
                            dummy: true,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        })
                        .then(() => {
                            // Collection created successfully
                            resolve();
                        })
                        .catch(error => {
                            reject(error);
                        });
                } else {
                    reject(error);
                }
            });
    });
} 