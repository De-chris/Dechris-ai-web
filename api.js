// SECURE API CONFIGURATION - Havenova-X Protocol
const API_CONFIG = {
    keys: [
        "ak_1gX15h2Sd9sr4SP3gZ84C1KT3gg6R",
        "ak_1oM1lq7G33vK9QK2Xu1dF3EL9kZ80"
    ],
    endpoint: "https://api.longcat.chat/openai/v1/chat/completions",
    currentIndex: 0,
    
    getKey() {
        const key = this.keys[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        return key;
    },
    
    async callAI(messages, isDeepThink = false) {
        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${this.getKey()}` 
            },
            body: JSON.stringify({
                model: isDeepThink ? "LongCat-Flash-Thinking" : "LongCat-Flash-Chat",
                messages: messages,
                temperature: 0.7,
                max_tokens: 4000
            })
        });
        
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        return data.choices[0].message.content;
    }
};

// Export for use in app.js
window.API_CONFIG = API_CONFIG;
