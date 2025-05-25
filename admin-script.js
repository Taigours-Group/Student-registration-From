// Admin Panel JavaScript for Student Management
let currentStudentId = null;
let studentsData = [];
let currentSection = 'dashboard';

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
    loadStoredData();
    updateDashboard();
});

// Initialize all admin panel functionality
function initializeAdminPanel() {
    setupNavigation();
    setupSearch();
    setupFilters();
    setupModals();
    setupEventListeners();
}

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get section to show
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

// Show specific section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update page title
    updatePageTitle(sectionName);
    
    // Load section data
    loadSectionData(sectionName);
    
    currentSection = sectionName;
}

// Update page title based on section
function updatePageTitle(section) {
    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Overview of student registrations and admissions' },
        applications: { title: 'All Applications', subtitle: 'Manage student applications and admissions' },
        approved: { title: 'Approved Students', subtitle: 'Students who have been accepted' },
        declined: { title: 'Declined Applications', subtitle: 'Applications that have been declined' },
        graduated: { title: 'Graduated Students', subtitle: 'Students who have completed their programs' },
        settings: { title: 'Settings', subtitle: 'Configure application and system settings' }
    };
    
    const titleInfo = titles[section] || { title: 'Admin Panel', subtitle: 'Student management system' };
    
    document.getElementById('page-title').textContent = titleInfo.title;
    document.getElementById('page-subtitle').textContent = titleInfo.subtitle;
}

// Load data for specific section
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'applications':
            loadApplicationsTable();
            break;
        case 'approved':
            loadApprovedTable();
            break;
        case 'declined':
            loadDeclinedTable();
            break;
        case 'graduated':
            loadGraduatedTable();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Load stored data from localStorage
function loadStoredData() {
    const stored = localStorage.getItem('neoStudentApplications');
    if (stored) {
        studentsData = JSON.parse(stored);
    }
}



// Save data to localStorage
function saveToStorage() {
    localStorage.setItem('neoStudentApplications', JSON.stringify(studentsData));
}

// Update dashboard statistics and data
function updateDashboard() {
    const stats = calculateStats();
    
    document.getElementById('total-applications').textContent = stats.total;
    document.getElementById('approved-count').textContent = stats.approved;
    document.getElementById('pending-count').textContent = stats.pending;
    document.getElementById('declined-count').textContent = stats.declined;
    document.getElementById('graduated-count').textContent = stats.graduated;
}

// Calculate statistics
function calculateStats() {
    const total = studentsData.length;
    const approved = studentsData.filter(s => s.status === 'approved').length;
    const pending = studentsData.filter(s => s.status === 'pending').length;
    const declined = studentsData.filter(s => s.status === 'declined').length;
    const graduated = studentsData.filter(s => s.status === 'graduated').length;
    
    return { total, approved, pending, declined, graduated };
}

// Load dashboard data
function loadDashboardData() {
    updateDashboard();
    loadRecentApplications();
}

// Load recent applications table
function loadRecentApplications() {
    const tableBody = document.getElementById('recent-applications-table');
    const recentApplications = studentsData
        .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate))
        .slice(0, 5);
    
    tableBody.innerHTML = recentApplications.map(student => `
        <tr>
            <td>${student.studentId}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${formatProgram(student.program)}</td>
            <td>${formatDate(student.applicationDate)}</td>
            <td><span class="status-badge status-${student.status}">${student.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="viewStudent('${student.studentId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load applications table
function loadApplicationsTable() {
    const tableBody = document.getElementById('applications-table');
    const filteredData = getFilteredApplications();
    
    tableBody.innerHTML = filteredData.map(student => `
        <tr>
            <td>${student.studentId}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${formatProgram(student.program)}</td>
            <td>${student.level}</td>
            <td>${formatDate(student.applicationDate)}</td>
            <td><span class="status-badge status-${student.status}">${student.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="viewStudent('${student.studentId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${student.status === 'pending' ? `
                        <button class="btn btn-success btn-sm" onclick="quickApprove('${student.studentId}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="quickDecline('${student.studentId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Load approved students table
function loadApprovedTable() {
    const tableBody = document.getElementById('approved-table');
    const approvedStudents = studentsData.filter(s => s.status === 'approved');
    
    tableBody.innerHTML = approvedStudents.map(student => `
        <tr>
            <td>${student.studentId}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${formatProgram(student.program)}</td>
            <td>${formatDate(student.startDate)}</td>
            <td>${formatDate(student.approvedDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="viewStudent('${student.studentId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="sendWelcomeEmail('${student.studentId}')">
                        <i class="fas fa-envelope"></i> Email
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load declined applications table
function loadDeclinedTable() {
    const tableBody = document.getElementById('declined-table');
    const declinedStudents = studentsData.filter(s => s.status === 'declined');
    
    tableBody.innerHTML = declinedStudents.map(student => `
        <tr>
            <td>${student.studentId}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${formatProgram(student.program)}</td>
            <td>${formatDeclineReason(student.declineReason)}</td>
            <td>${formatDate(student.declinedDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="viewStudent('${student.studentId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="reconsiderApplication('${student.studentId}')">
                        <i class="fas fa-undo"></i> Reconsider
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteStudent('${student.studentId}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load graduated students table
function loadGraduatedTable() {
    const tableBody = document.getElementById('graduated-table');
    const graduatedStudents = studentsData.filter(s => s.status === 'graduated');
    
    tableBody.innerHTML = graduatedStudents.map(student => `
        <tr>
            <td>${student.studentId}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.email}</td>
            <td>${formatProgram(student.program)}</td>
            <td>${formatDate(student.startDate)}</td>
            <td>${formatDate(student.graduationDate)}</td>
            <td>${calculateDuration(student.startDate, student.graduationDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-sm" onclick="viewStudent('${student.studentId}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="generateCertificate('${student.studentId}')">
                        <i class="fas fa-certificate"></i> Certificate
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get filtered applications based on current filters
function getFilteredApplications() {
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const programFilter = document.getElementById('programFilter')?.value || '';
    const searchTerm = document.getElementById('searchInput')?.value?.toLowerCase() || '';
    
    return studentsData.filter(student => {
        const matchesStatus = !statusFilter || student.status === statusFilter;
        const matchesProgram = !programFilter || student.program === programFilter;
        const matchesSearch = !searchTerm || 
            student.firstName.toLowerCase().includes(searchTerm) ||
            student.lastName.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.studentId.toLowerCase().includes(searchTerm);
        
        return matchesStatus && matchesProgram && matchesSearch;
    });
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            if (currentSection === 'applications') {
                loadApplicationsTable();
            }
        });
    }
}

// Setup filters
function setupFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const programFilter = document.getElementById('programFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', loadApplicationsTable);
    }
    
    if (programFilter) {
        programFilter.addEventListener('change', loadApplicationsTable);
    }
}

// View student details
function viewStudent(studentId) {
    const student = studentsData.find(s => s.studentId === studentId);
    if (!student) return;
    
    currentStudentId = studentId;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = createStudentDetailsHTML(student);
    
    // Update modal footer buttons based on status
    const approveBtn = document.getElementById('approveBtn');
    const declineBtn = document.getElementById('declineBtn');
    const graduateBtn = document.getElementById('graduateBtn');
    
    if (student.status === 'pending') {
        approveBtn.style.display = 'inline-flex';
        declineBtn.style.display = 'inline-flex';
        graduateBtn.style.display = 'none';
    } else if (student.status === 'approved') {
        approveBtn.style.display = 'none';
        declineBtn.style.display = 'none';
        graduateBtn.style.display = 'inline-flex';
    } else {
        approveBtn.style.display = 'none';
        declineBtn.style.display = 'none';
        graduateBtn.style.display = 'none';
    }
    
    document.getElementById('studentModal').classList.add('show');
}

// Create student details HTML
function createStudentDetailsHTML(student) {
    return `
        <div class="student-details">
            <div class="detail-section">
                <div class="student-photo">
                    <img src="https://via.placeholder.com/120x120/00ffe7/000000?text=${student.firstName[0]}${student.lastName[0]}" 
                         alt="${student.firstName} ${student.lastName}">
                </div>
                <h4>Basic Information</h4>
                <div class="detail-item">
                    <span class="label">Student ID:</span>
                    <span class="value">${student.studentId}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Status:</span>
                    <span class="value"><span class="status-badge status-${student.status}">${student.status}</span></span>
                </div>
                <div class="detail-item">
                    <span class="label">Application Date:</span>
                    <span class="value">${formatDate(student.applicationDate)}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Personal Information</h4>
                <div class="detail-item">
                    <span class="label">Full Name:</span>
                    <span class="value">${student.firstName} ${student.lastName}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Email:</span>
                    <span class="value">${student.email}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Phone:</span>
                    <span class="value">${student.phone}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Date of Birth:</span>
                    <span class="value">${formatDate(student.dateOfBirth)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Gender:</span>
                    <span class="value">${student.gender}</span>
                </div>
            </div>

            <div class="detail-section">
                <h4>Parents Details</h4>
                <div class="detail-item">
                    <span class="label">Father's Name:</span>
                    <span class="value">${student.fatherName || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Mother's Name:</span>
                    <span class="value">${student.motherName || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Guardian's Name:</span>
                    <span class="value">${student.guardianName || '-'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Parents' Contact:</span>
                    <span class="value">${student.parentsContact || '-'}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Academic Information</h4>
                <div class="detail-item">
                    <span class="label">Program:</span>
                    <span class="value">${formatProgram(student.program)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Level:</span>
                    <span class="value">${student.level}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Start Date:</span>
                    <span class="value">${formatDate(student.startDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Emergency Contact:</span>
                    <span class="value">${student.emergencyContact}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Address Information</h4>
                <div class="detail-item">
                    <span class="label">Address:</span>
                    <span class="value">${student.address}</span>
                </div>
                <div class="detail-item">
                    <span class="label">City:</span>
                    <span class="value">${student.city}</span>
                </div>
                <div class="detail-item">
                    <span class="label">State:</span>
                    <span class="value">${student.state}</span>
                </div>
                <div class="detail-item">
                    <span class="label">ZIP Code:</span>
                    <span class="value">${student.zipCode}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Country:</span>
                    <span class="value">${student.country}</span>
                </div>
            </div>
            
            ${student.education || student.accommodations ? `
            <div class="detail-section">
                <h4>Additional Information</h4>
                ${student.education ? `
                <div class="detail-item">
                    <span class="label">Education:</span>
                    <span class="value">${student.education}</span>
                </div>
                ` : ''}
                ${student.accommodations ? `
                <div class="detail-item">
                    <span class="label">Accommodations:</span>
                    <span class="value">${student.accommodations}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            ${student.status === 'declined' && student.declineReason ? `
            <div class="detail-section">
                <h4>Decline Information</h4>
                <div class="detail-item">
                    <span class="label">Reason:</span>
                    <span class="value">${formatDeclineReason(student.declineReason)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Date:</span>
                    <span class="value">${formatDate(student.declinedDate)}</span>
                </div>
                ${student.declineNotes ? `
                <div class="detail-item">
                    <span class="label">Notes:</span>
                    <span class="value">${student.declineNotes}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}
        </div>
    `;
}

// Approve student
function approveStudent() {
    if (!currentStudentId) return;
    
    const student = studentsData.find(s => s.studentId === currentStudentId);
    if (student) {
        student.status = 'approved';
        student.approvedDate = new Date().toISOString();
        
        saveToStorage();
        showNotification('Student application approved successfully!', 'success');
        closeStudentModal();
        updateDashboard();
        loadSectionData(currentSection);
    }
}

// Quick approve from table
function quickApprove(studentId) {
    currentStudentId = studentId;
    approveStudent();
}

// Show decline modal
function showDeclineModal() {
    document.getElementById('declineModal').classList.add('show');
}

// Close decline modal
function closeDeclineModal() {
    document.getElementById('declineModal').classList.remove('show');
    document.getElementById('declineForm').reset();
}

// Quick decline from table
function quickDecline(studentId) {
    currentStudentId = studentId;
    showDeclineModal();
}

// Confirm decline
function confirmDecline() {
    if (!currentStudentId) return;
    
    const reason = document.getElementById('declineReason').value;
    const notes = document.getElementById('additionalNotes').value;
    
    if (!reason) {
        showNotification('Please select a decline reason', 'error');
        return;
    }
    
    const student = studentsData.find(s => s.studentId === currentStudentId);
    if (student) {
        student.status = 'declined';
        student.declineReason = reason;
        student.declineNotes = notes;
        student.declinedDate = new Date().toISOString();
        
        saveToStorage();
        showNotification('Student application declined', 'warning');
        closeDeclineModal();
        closeStudentModal();
        updateDashboard();
        loadSectionData(currentSection);
    }
}

// Close student modal
function closeStudentModal() {
    document.getElementById('studentModal').classList.remove('show');
    currentStudentId = null;
}

// Setup modal event listeners
function setupModals() {
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
}

// Setup other event listeners
function setupEventListeners() {
    // Export buttons
    document.getElementById('exportApproved')?.addEventListener('click', exportApprovedStudents);
    document.getElementById('exportDeclined')?.addEventListener('click', exportDeclinedApplications);
    document.getElementById('exportGraduated')?.addEventListener('click', exportGraduatedStudents);
    document.getElementById('exportAll')?.addEventListener('click', exportAllData);
    
    // Bulk graduate button
    document.getElementById('bulkGraduate')?.addEventListener('click', showBulkGraduateModal);
    
    // Settings form
    document.getElementById('applicationSettings')?.addEventListener('submit', saveSettings);
    
    // Data management buttons
    document.getElementById('clearOldData')?.addEventListener('click', clearOldData);
    document.getElementById('resetData')?.addEventListener('click', resetAllData);
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatProgram(program) {
    const programs = {
        'computer-science': 'Computer Science',
        'artificial-intelligence': 'Artificial Intelligence',
        'robotics': 'Robotics Engineering',
        'biotechnology': 'Biotechnology',
        'quantum-computing': 'Quantum Computing',
        'space-technology': 'Space Technology'
    };
    return programs[program] || program;
}

function formatDeclineReason(reason) {
    const reasons = {
        'incomplete-documents': 'Incomplete Documents',
        'academic-requirements': 'Academic Requirements Not Met',
        'program-full': 'Program Full',
        'eligibility-criteria': 'Eligibility Criteria Not Met',
        'other': 'Other'
    };
    return reasons[reason] || reason;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notificationMessage');
    
    messageElement.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Export functions
function exportApprovedStudents() {
    const approvedStudents = studentsData.filter(s => s.status === 'approved');
    exportToCSV(approvedStudents, 'approved_students.csv');
}

function exportDeclinedApplications() {
    const declinedStudents = studentsData.filter(s => s.status === 'declined');
    exportToCSV(declinedStudents, 'declined_applications.csv');
}

function exportGraduatedStudents() {
    const graduatedStudents = studentsData.filter(s => s.status === 'graduated');
    exportToCSV(graduatedStudents, 'graduated_students.csv');
}

function exportAllData() {
    exportToCSV(studentsData, 'all_applications.csv');
}

function exportToCSV(data, filename) {
    if (data.length === 0) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification(`Exported ${data.length} records to ${filename}`, 'success');
}

// Settings functions
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('neoStudentSettings') || '{}');
    
    document.getElementById('autoApproval').checked = settings.autoApproval || false;
    document.getElementById('notificationEmail').value = settings.notificationEmail || '';
    document.getElementById('maxApplications').value = settings.maxApplications || 50;
}

function saveSettings(e) {
    e.preventDefault();
    
    const settings = {
        autoApproval: document.getElementById('autoApproval').checked,
        notificationEmail: document.getElementById('notificationEmail').value,
        maxApplications: parseInt(document.getElementById('maxApplications').value)
    };
    
    localStorage.setItem('neoStudentSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
}

// Data management functions
function clearOldData() {
    if (confirm('Are you sure you want to clear applications older than 30 days?')) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        
        const originalCount = studentsData.length;
        studentsData = studentsData.filter(s => new Date(s.applicationDate) > cutoffDate);
        
        saveToStorage();
        const clearedCount = originalCount - studentsData.length;
        showNotification(`Cleared ${clearedCount} old applications`, 'success');
        updateDashboard();
        loadSectionData(currentSection);
    }
}

function resetAllData() {
    if (confirm('Are you sure you want to reset ALL data? This action cannot be undone.')) {
        if (confirm('This will permanently delete all student applications. Are you absolutely sure?')) {
            studentsData = [];
            saveToStorage();
            showNotification('All data has been reset', 'warning');
            updateDashboard();
            loadSectionData(currentSection);
        }
    }
}

// Manual refresh function
function refreshAdminData() {
    const refreshBtn = document.getElementById('refreshData');
    const originalText = refreshBtn.innerHTML;
    
    // Show loading state
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    refreshBtn.disabled = true;
    
    setTimeout(() => {
        loadStoredData();
        updateDashboard();
        loadSectionData(currentSection);
        showNotification('Data refreshed successfully!', 'success');
        
        // Restore button
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
    }, 1000);
}

// Delete student functions
function deleteStudent(studentId) {
    currentStudentId = studentId;
    showDeleteConfirmation();
}

function showDeleteConfirmation() {
    if (!currentStudentId) return;
    
    const student = studentsData.find(s => s.studentId === currentStudentId);
    if (!student) return;
    
    const deleteStudentInfo = document.getElementById('deleteStudentInfo');
    deleteStudentInfo.innerHTML = `
        <div class="detail-item">
            <span class="label">Student ID:</span>
            <span class="value">${student.studentId}</span>
        </div>
        <div class="detail-item">
            <span class="label">Name:</span>
            <span class="value">${student.firstName} ${student.lastName}</span>
        </div>
        <div class="detail-item">
            <span class="label">Email:</span>
            <span class="value">${student.email}</span>
        </div>
        <div class="detail-item">
            <span class="label">Program:</span>
            <span class="value">${formatProgram(student.program)}</span>
        </div>
    `;
    
    document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    currentStudentId = null;
}

function confirmDelete() {
    if (!currentStudentId) return;
    
    const studentIndex = studentsData.findIndex(s => s.studentId === currentStudentId);
    if (studentIndex !== -1) {
        const deletedStudent = studentsData[studentIndex];
        studentsData.splice(studentIndex, 1);
        
        saveToStorage();
        showNotification(`Student ${deletedStudent.firstName} ${deletedStudent.lastName} has been deleted permanently`, 'warning');
        closeDeleteModal();
        closeStudentModal();
        updateDashboard();
        loadSectionData(currentSection);
    }
}

// Graduation functions
function graduateStudent() {
    if (!currentStudentId) return;
    
    const today = new Date().toISOString().split('T')[0];
    const graduationDate = prompt('Enter graduation date (YYYY-MM-DD):', today);
    
    if (!graduationDate) return;
    
    const student = studentsData.find(s => s.studentId === currentStudentId);
    if (student && student.status === 'approved') {
        student.status = 'graduated';
        student.graduationDate = graduationDate;
        
        saveToStorage();
        showNotification(`${student.firstName} ${student.lastName} has been graduated!`, 'success');
        closeStudentModal();
        updateDashboard();
        loadSectionData(currentSection);
    }
}

function showBulkGraduateModal() {
    const approvedStudents = studentsData.filter(s => s.status === 'approved');
    
    if (approvedStudents.length === 0) {
        showNotification('No approved students available for graduation', 'warning');
        return;
    }
    
    const bulkGraduateList = document.getElementById('bulkGraduateList');
    bulkGraduateList.innerHTML = approvedStudents.map(student => `
        <div class="graduate-item">
            <input type="checkbox" id="graduate-${student.studentId}" value="${student.studentId}">
            <div class="graduate-item-info">
                <div class="graduate-item-name">${student.firstName} ${student.lastName}</div>
                <div class="graduate-item-details">${student.studentId} • ${formatProgram(student.program)} • Started: ${formatDate(student.startDate)}</div>
            </div>
        </div>
    `).join('');
    
    // Set default graduation date to today
    document.getElementById('graduationDate').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('bulkGraduateModal').classList.add('show');
}

function closeBulkGraduateModal() {
    document.getElementById('bulkGraduateModal').classList.remove('show');
}

function confirmBulkGraduation() {
    const graduationDate = document.getElementById('graduationDate').value;
    
    if (!graduationDate) {
        showNotification('Please select a graduation date', 'error');
        return;
    }
    
    const selectedStudents = [];
    const checkboxes = document.querySelectorAll('#bulkGraduateList input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        selectedStudents.push(checkbox.value);
    });
    
    if (selectedStudents.length === 0) {
        showNotification('Please select at least one student to graduate', 'warning');
        return;
    }
    
    let graduatedCount = 0;
    selectedStudents.forEach(studentId => {
        const student = studentsData.find(s => s.studentId === studentId);
        if (student && student.status === 'approved') {
            student.status = 'graduated';
            student.graduationDate = graduationDate;
            graduatedCount++;
        }
    });
    
    saveToStorage();
    showNotification(`Successfully graduated ${graduatedCount} students!`, 'success');
    closeBulkGraduateModal();
    updateDashboard();
    loadSectionData(currentSection);
}

function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
        return `${years}y ${months}m`;
    } else if (months > 0) {
        return `${months} months`;
    } else {
        return `${diffDays} days`;
    }
}

function generateCertificate(studentId) {
    const student = studentsData.find(s => s.studentId === studentId);
    if (student) {
        showNotification(`Certificate generated for ${student.firstName} ${student.lastName}`, 'success');
        // In a real application, this would generate and download a PDF certificate
    }
}

// Additional utility functions
function reconsiderApplication(studentId) {
    const student = studentsData.find(s => s.studentId === studentId);
    if (student && confirm('Mark this application as pending for reconsideration?')) {
        student.status = 'pending';
        delete student.declineReason;
        delete student.declineNotes;
        delete student.declinedDate;
        
        saveToStorage();
        showNotification('Application marked for reconsideration', 'success');
        updateDashboard();
        loadSectionData(currentSection);
    }
}

function sendWelcomeEmail(studentId) {
    const student = studentsData.find(s => s.studentId === studentId);
    if (student) {
        // In a real application, this would send an actual email
        showNotification(`Welcome email sent to ${student.firstName} ${student.lastName}`, 'success');
    }
}

// Listen for new registrations from the main registration form
window.addEventListener('storage', function(e) {
    if (e.key === 'neoStudentApplications') {
        console.log('New application detected, refreshing admin panel...');
        loadStoredData();
        updateDashboard();
        loadSectionData(currentSection);
        showNotification('New application received!', 'success');
    }
});

// Also listen for custom storage events from same window
document.addEventListener('DOMContentLoaded', function() {
    // Check for updates every 5 seconds as backup
    setInterval(function() {
        const currentData = localStorage.getItem('neoStudentApplications');
        if (currentData) {
            const newData = JSON.parse(currentData);
            if (newData.length !== studentsData.length) {
                console.log('Data change detected, updating admin panel...');
                loadStoredData();
                updateDashboard();
                loadSectionData(currentSection);
            }
        }
    }, 5000);
});