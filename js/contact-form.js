class ContactForm {
    constructor() {
        this.formspreeEndpoint = localStorage.getItem('formspree_endpoint') || '';
        this.container = document.getElementById('contact-section');
    }

    init() {
        this.render();
        this.bindEvents();
    }

    setEndpoint(endpoint) {
        this.formspreeEndpoint = endpoint;
        localStorage.setItem('formspree_endpoint', endpoint);
    }

    render() {
        if (!this.container) return;

        const currentLang = i18n ? i18n.currentLanguage : 'zh';
        const labels = {
            'zh': { name: '姓名', email: '邮箱', subject: '主题', message: '留言内容', submit: '提交', sending: '发送中...', success: '提交成功！我们会尽快回复您。', error: '提交失败，请稍后重试。' },
            'en': { name: 'Name', email: 'Email', subject: 'Subject', message: 'Message', submit: 'Submit', sending: 'Sending...', success: 'Thank you! We will get back to you soon.', error: 'Submission failed. Please try again later.' },
            'ko': { name: '이름', email: '이메일', subject: '제목', message: '메시지', submit: '보내기', sending: '전송 중...', success: '감사합니다! 최대한 빨리 답변드리겠습니다.', error: '전송 실패. 나중에 다시 시도해주세요.' }
        };

        const t = labels[currentLang] || labels['zh'];

        this.container.innerHTML = `
            <div class="contact-form-wrapper">
                <h2>${t.name}</h2>
                <form id="contact-form" class="contact-form">
                    <div class="form-group">
                        <label for="contact-name">${t.name}</label>
                        <input type="text" id="contact-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-email">${t.email}</label>
                        <input type="email" id="contact-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-subject">${t.subject}</label>
                        <input type="text" id="contact-subject" name="subject" required>
                    </div>
                    <div class="form-group">
                        <label for="contact-message">${t.message}</label>
                        <textarea id="contact-message" name="message" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary" id="submit-contact">${t.submit}</button>
                </form>
                <div id="contact-status" class="contact-status"></div>
            </div>
        `;
    }

    bindEvents() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submit-contact');
            const statusDiv = document.getElementById('contact-status');
            const currentLang = i18n ? i18n.currentLanguage : 'zh';
            const labels = {
                'zh': { sending: '发送中...', success: '提交成功！我们会尽快回复您。', error: '提交失败，请稍后重试。' },
                'en': { sending: 'Sending...', success: 'Thank you! We will get back to you soon.', error: 'Submission failed. Please try again later.' },
                'ko': { sending: '전송 중...', success: '감사합니다! 최대한 빨리 답변드리겠습니다.', error: '전송 실패. 나중에 다시 시도해주세요.' }
            };

            const t = labels[currentLang] || labels['zh'];

            submitBtn.disabled = true;
            submitBtn.textContent = t.sending;
            statusDiv.textContent = '';

            const formData = new FormData(form);

            try {
                if (this.formspreeEndpoint) {
                    const response = await fetch(this.formspreeEndpoint, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        statusDiv.textContent = t.success;
                        statusDiv.className = 'contact-status success';
                        form.reset();
                    } else {
                        throw new Error('Formspree submission failed');
                    }
                } else {
                    const subject = encodeURIComponent(formData.get('subject'));
                    const body = encodeURIComponent(`姓名: ${formData.get('name')}\n邮箱: ${formData.get('email')}\n\n${formData.get('message')}`);
                    window.location.href = `mailto:info@example.com?subject=${subject}&body=${body}`;
                    statusDiv.textContent = t.success;
                    statusDiv.className = 'contact-status success';
                    form.reset();
                }
            } catch (error) {
                console.error('Contact form error:', error);
                statusDiv.textContent = t.error;
                statusDiv.className = 'contact-status error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = labels[currentLang].submit || labels['zh'].submit;
            }
        });
    }

    updateLanguage() {
        this.render();
        this.bindEvents();
    }
}

const contactForm = new ContactForm();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = contactForm;
} else {
    window.contactForm = contactForm;
}
