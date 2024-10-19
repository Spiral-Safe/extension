import { Keypair } from "@solana/web3.js";

function updateUI() {
    const isLoggedIn = localStorage.getItem('username') && localStorage.getItem('secretKey');
    if (isLoggedIn) {
        document.getElementById('loginContainer')?.classList.add('hidden');
        document.getElementById('extensionContainer')?.classList.remove('hidden');

        // Retrieve the secret key from localStorage
        const secretKeyArray = JSON.parse(localStorage.getItem('secretKey') || '[]');

        // Create a Keypair from the secret key
        const secretKeyUint8Array = new Uint8Array(secretKeyArray);
        const keypair = Keypair.fromSecretKey(secretKeyUint8Array);

        // Display the public key
        const publicKeyDisplay = document.getElementById('publicKeyDisplay');
        if (publicKeyDisplay) {
            publicKeyDisplay.textContent = `Public Key: ${keypair.publicKey.toBase58()}`;
        }
    } else {
        document.getElementById('loginContainer')?.classList.remove('hidden');
        document.getElementById('extensionContainer')?.classList.add('hidden');
    }
}

document.getElementById('loginForm')?.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting normally

    const username = (document.getElementById('username') as HTMLInputElement)?.value;

    if (!localStorage.getItem('secretKey')) {
        // Mock registration by storing the username
        localStorage.setItem('username', username);
        const keypair = Keypair.generate();
        localStorage.setItem('secretKey', JSON.stringify(Array.from(keypair.secretKey)));
    }

    updateUI();
});

document.getElementById('sign')?.addEventListener('click', function () {
    const secretKeyArray = JSON.parse(localStorage.getItem('secretKey') || '[]');
    chrome.runtime.sendMessage({
        type: 'SPIRALSAFE_KEYPAIR_RESPONSE',
        payload: secretKeyArray,
        sender: 'spiralSafeExtension'
    });
    // Close the extension popup after sending the message
    window.close();
});

document.getElementById('signOut')?.addEventListener('click', function () {
    localStorage.removeItem('secretKey');
    localStorage.removeItem('username');
    updateUI();
});

// Call updateUI initially to set the correct state
updateUI();
