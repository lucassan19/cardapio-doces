// O array de dados principal que define o cardápio
const menuData = [
    {
        id: 'doce1',
        name: 'Cone Trufado',
        description: 'Nosso campeão de vendas, feito com receita secreta.',
        image: 'img/conex.jpg',
        flavors: [
            // Preços diferentes por sabor
            { id: 'd1s1', name: 'Ninho com Nutella', price: 11.50 }, 
            { id: 'd1s2', name: 'Ninho com Bis', price: 12.00 },   
            { id: 'd1s3', name: 'Nutella', price: 12.00 },
            { id: 'd1s4', name: 'Brigadeiro', price: 10.00 },
            { id: 'd1s5', name: 'Ninho', price: 10.00 }
        ] 
    },
    {
        id: 'doce2',
        name: 'Pão de Mel',
        description: 'Pão de mel fresco e leve, ideal para qualquer momento.',
        image: 'img/paodemel.jpg',
        flavors: [ 
            // Sabor ÚNICO
            { id: 'd2s1', name: 'Doce de Leite', price: 10.00 }] 
    },
    {
        id: 'doce3',
        name: 'Alfajor',
        description: 'Aquele alfajor de respeito.',
        image: 'img/alfajor.jpg',
        flavors: [{ id: 'd3s1', name: 'Alfajor Clássico', price: 6.00 }] 
    },
    {
        id: 'doce4',
        name: 'Coxinha de Morango',
        description: 'Macio por fora e por dentro, irresistível.',
        image: 'img/coxinha.jpg',
        flavors: [
            // Múltiplos sabores para testar o rádio button
            { id: 'd4s1', name: 'Coxinha de Morango Pequena', image: 'img/coxinha.jpg', price: 8.50 },
            { id: 'd4s2', name: 'Coxinha de Morango Grande', image: 'img/coxinha.jpg', price: 15.00 }
        ] 
    }
];

// Estado atual do pedido do cliente (CARRINHO)
let currentOrder = {
    doces: [], 
    selectedItem: null, 
    totalValue: 0 
};

// Elementos do DOM e Constantes de Serviço
const menuSection = document.getElementById('menu-section');
const orderDetailsDiv = document.getElementById('order-details');
const orderForm = document.getElementById('order-form');
const deliveryOptionRadios = document.querySelectorAll('input[name="delivery-option"]');
const addressGroup = document.getElementById('address-group');
const clientNameInput = document.getElementById('client-name');
const orderStatus = document.getElementById('order-status');
const cartSummaryDiv = document.getElementById('cart-summary'); 
const phoneNumber = '5517991281851';

// Taxa de Entrega
const DELIVERY_FEE = 5.00; 

/**
 * Função para renderizar o cardápio principal.
 */
function renderMenu() {
    const menuList = document.createElement('div');
    menuList.className = 'menu-list';

    menuData.forEach(doce => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <img src="${doce.image}" alt="${doce.name}">
            <div class="card-info">
                <h3>${doce.name}</h3>
                <p>${doce.description}</p>
                <button class="select-button" data-doce-id="${doce.id}">Fazer Pedido</button>
            </div>
        `;
        menuList.appendChild(card);
    });

    menuSection.appendChild(menuList);

    document.querySelectorAll('.select-button').forEach(button => {
        button.addEventListener('click', handleDoceSelection);
    });
}

/**
 * Gerencia o clique no botão de 'Fazer Pedido' e inicializa a configuração.
 */
function handleDoceSelection(event) {
    const doceId = event.target.getAttribute('data-doce-id');
    const doce = menuData.find(d => d.id === doceId);
    
    // Define o sabor e preço padrão se houver apenas 1 opção
    const defaultFlavor = doce.flavors.length === 1 ? doce.flavors[0] : null;

    currentOrder.selectedItem = {
        doce: doce.name,
        flavors: doce.flavors,
        selectedFlavor: defaultFlavor ? defaultFlavor.name : null, 
        selectedPrice: defaultFlavor ? defaultFlavor.price : null, 
        quantity: 1
    };

    renderOrderConfiguration(doce);

    const orderDetailsSection = document.getElementById('order-section');
    orderDetailsSection.scrollIntoView({
        behavior: 'smooth' 
    });
}

/**
 * Renderiza o formulário interativo de seleção de sabor, quantidade e preço.
 * ATUALIZADO para exibir sabor único ou rádio buttons.
 */
function renderOrderConfiguration(doce) {
    const hasFlavors = doce.flavors.length > 1;

    let flavorOptionsHTML = '';
    
    // Condição para SABOR ÚNICO
    if (!hasFlavors) {
        // Se houver apenas 1 sabor, exibe-o como texto estático
        const flavor = doce.flavors[0];
        flavorOptionsHTML = `
            <div class="form-group">
                <label>Sabor Selecionado:</label>
                <p><strong>${flavor.name}</strong> (R$ ${flavor.price.toFixed(2)})</p>
            </div>
        `;
    } 
    
    // Condição para MÚLTIPLOS SABORES
    if (hasFlavors) {
        flavorOptionsHTML = `
            <div class="form-group">
                <label>Selecione o Sabor:</label>
                <div class="radio-group" id="flavor-selection">
                    ${doce.flavors.map(flavor => `
                        <input type="radio" id="${flavor.id}" name="doce-flavor" value="${flavor.name}" data-price="${flavor.price.toFixed(2)}" ${currentOrder.selectedItem.selectedFlavor === flavor.name ? 'checked' : ''} required>
                        <label for="${flavor.id}">${flavor.name} (R$ ${flavor.price.toFixed(2)})</label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    orderDetailsDiv.innerHTML = `
        <h3>Configurar ${doce.name}</h3>
        ${flavorOptionsHTML}
        
        <div class="form-group">
            <label for="quantity">Quantidade:</label>
            <input type="number" id="quantity" name="quantity" min="1" value="${currentOrder.selectedItem.quantity}" required>
        </div>
        
        <p><strong>Valor Unitário:</strong> <span id="unit-price-display">R$ ${currentOrder.selectedItem.selectedPrice ? currentOrder.selectedItem.selectedPrice.toFixed(2) : '0.00'}</span></p>

        <button type="button" class="add-to-cart-button" id="add-to-cart-btn">Adicionar ao Pedido</button>
    `;
    
    const updatePriceDisplay = (price) => {
        const display = document.getElementById('unit-price-display');
        if (display) display.textContent = `R$ ${price.toFixed(2)}`;
    }

    // O listener só é necessário se houver múltiplos sabores (radio buttons)
    if (hasFlavors) {
        document.querySelectorAll('input[name="doce-flavor"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const price = parseFloat(e.target.getAttribute('data-price'));
                currentOrder.selectedItem.selectedFlavor = e.target.value;
                currentOrder.selectedItem.selectedPrice = price;
                updatePriceDisplay(price);
                updateOrderStatus(`Sabor selecionado: ${e.target.value}.`);
            });
        });
    }

    document.getElementById('quantity').addEventListener('change', (e) => {
        const newQuantity = parseInt(e.target.value);
        currentOrder.selectedItem.quantity = newQuantity >= 1 ? newQuantity : 1;
        e.target.value = currentOrder.selectedItem.quantity;
        updateOrderStatus(`Quantidade: ${currentOrder.selectedItem.quantity}.`);
    });

    document.getElementById('add-to-cart-btn').addEventListener('click', addItemToCart);

    updateOrderStatus(`Configure o seu ${doce.name} e clique em "Adicionar ao Pedido".`);
}

/**
 * Adiciona o item configurado ao array do carrinho.
 */
function addItemToCart() {
    const item = currentOrder.selectedItem;

    if (!item || !item.selectedPrice) { 
        alert('Por favor, selecione um sabor válido.');
        return;
    }

    const doceConfig = menuData.find(d => d.name === item.doce);
    if (doceConfig.flavors.length > 1 && !item.selectedFlavor) {
        alert('Por favor, selecione o sabor do seu doce.');
        return;
    }
    if (item.quantity < 1) {
        alert('A quantidade deve ser pelo menos 1.');
        return;
    }

    currentOrder.doces.push({ ...item });
    currentOrder.selectedItem = null;
    
    renderCartSummary();
    
    orderDetailsDiv.innerHTML = '<p>Item adicionado! Selecione outro doce acima ou finalize seu pedido.</p>';
    updateOrderStatus(`✅ ${item.doce} (${item.selectedFlavor || 'Único'}) x${item.quantity} adicionado ao pedido!`);
    
    // Atualiza o status de prontidão depois de adicionar
    updateReadyStatus();
}

/**
 * Remove um item do carrinho.
 */
function removeItemFromCart(index) {
    currentOrder.doces.splice(index, 1);
    renderCartSummary();
    updateOrderStatus('Item removido do pedido.');
    // Atualiza o status de prontidão depois de remover
    updateReadyStatus();
}

/**
 * Renderiza a lista de itens no carrinho e calcula o total.
 */
function renderCartSummary() {
    const submitButton = document.querySelector('.submit-button');
    let totalValue = 0; 
    
    if (currentOrder.doces.length === 0) {
        cartSummaryDiv.innerHTML = '<h3>Carrinho Vazio</h3>';
        submitButton.disabled = true; 
        clientNameInput.required = false;
        return;
    }

    submitButton.disabled = false;
    clientNameInput.required = true;
    
    let html = '<h3>Seus Doces:</h3>';
    
    currentOrder.doces.forEach((item, index) => {
        const itemTotal = item.selectedPrice * item.quantity; 
        totalValue += itemTotal; 

        html += `
            <div class="cart-item">
                <div class="cart-item-details">
                    <strong>x${item.quantity} - ${item.doce}</strong>
                    <span>Sabor: ${item.selectedFlavor || 'Único'} (R$ ${item.selectedPrice.toFixed(2)}/un)</span>
                </div>
                <div>R$ ${itemTotal.toFixed(2)}</div>
                <button type="button" class="remove-item-button" data-index="${index}">🗑️</button>
            </div>
        `;
    });
    
    html += `
        <div class="cart-item" style="border-top: 2px solid var(--secondary-color); margin-top: 10px; padding-top: 10px;">
            <strong>VALOR TOTAL DOS DOCES:</strong>
            <strong>R$ ${totalValue.toFixed(2)}</strong>
            <span></span>
        </div>
    `;

    cartSummaryDiv.innerHTML = html;
    
    document.querySelectorAll('.remove-item-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const indexToRemove = parseInt(e.target.getAttribute('data-index'));
            removeItemFromCart(indexToRemove);
        });
    });
    
    currentOrder.totalValue = totalValue;
}

/**
 * Atualiza o texto de status do pedido.
 */
function updateOrderStatus(message) {
    orderStatus.innerHTML = message; // Usando innerHTML para o negrito do status de pronto
}

/**
 * Monitora o preenchimento dos campos obrigatórios e atualiza a mensagem de status.
 */
function updateReadyStatus() {
    // 1. Verifica os requisitos básicos
    const nameFilled = clientNameInput.value.trim().length > 0;
    const paymentSelected = document.querySelector('input[name="payment-method"]:checked');
    const optionSelected = document.querySelector('input[name="delivery-option"]:checked');
    const cartHasItems = currentOrder.doces.length > 0;

    let isReady = false;

    if (nameFilled && paymentSelected && optionSelected && cartHasItems) {
        // 2. Verifica a condição de endereço (se for entrega)
        if (optionSelected.value === 'Entrega') {
            const addressField = document.getElementById('address');
            const addressFilled = addressField && addressField.value.trim().length > 0;
            isReady = addressFilled;
        } else {
            // Se for retirada, está pronto
            isReady = true;
        }
    }
    
    // 3. Define a mensagem de status e o botão
    const submitButton = document.querySelector('.submit-button');
    
    if (isReady) {
        // MENSAGEM DE SUCESSO!
        updateOrderStatus('🎉 **Tudo certo!** Clique abaixo para concluir seu pedido no WhatsApp.');
        submitButton.disabled = false;
    } else if (cartHasItems) {
        // MENSAGEM DE AVISO (Falta preencher algo)
        updateOrderStatus('Ainda faltam informações! Preencha todos os campos para finalizar.');
        submitButton.disabled = true;
    } else {
         // MENSAGEM INICIAL (Carrinho vazio)
         updateOrderStatus('Clique em "Fazer Pedido" para começar.');
         submitButton.disabled = true;
    }
}

/**
 * Gerencia a visibilidade do campo de Endereço e mostra o valor da taxa.
 */
function handleDeliveryOptionChange() {
    const selectedOption = document.querySelector('input[name="delivery-option"]:checked')?.value;
    
    if (selectedOption === 'Entrega') {
        addressGroup.style.display = 'block';
        
        addressGroup.innerHTML = `
            <label for="address">Endereço de Entrega:</label>
            <textarea id="address" name="address" rows="2" placeholder="Rua, Número, Bairro, Ponto de Referência" required></textarea>
            <p>*Taxa de entrega: R$ ${DELIVERY_FEE.toFixed(2)} (será adicionada ao total final)</p>
        `;
        document.getElementById('address').required = true;
        
        // Adiciona o listener de input para o campo de endereço
        document.getElementById('address').addEventListener('input', updateReadyStatus);
        
    } else {
        addressGroup.style.display = 'none';
        
        addressGroup.innerHTML = `
            <label for="address">Endereço de Entrega:</label>
            <textarea id="address" name="address" rows="2" placeholder="Rua, Número, Bairro, Ponto de Referência"></textarea>
        `;
        document.getElementById('address').required = false;
    }
    
    // Chama o monitoramento de status
    updateReadyStatus();
}

/**
 * Gera o link do WhatsApp com TODOS os itens do carrinho e valor final.
 */
function generateWhatsAppMessage() {
    // Coleta dos dados
    const name = clientNameInput.value.trim();
    const payment = document.querySelector('input[name="payment-method"]:checked')?.value;
    const option = document.querySelector('input[name="delivery-option"]:checked')?.value;
    const address = document.getElementById('address')?.value.trim();

    // Validação na ordem de prioridade (funciona por causa do novalidate no HTML)
    
    if (currentOrder.doces.length === 0) {
        alert('❌ Seu carrinho está vazio. Por favor, adicione um doce.');
        return null;
    }

    if (!name) {
        alert('⚠️ Por favor, preencha o seu nome.');
        clientNameInput.focus();
        return null;
    }
    
    if (!payment) {
        alert('⚠️ Por favor, selecione uma forma de pagamento (Pix, Cartão ou Dinheiro).');
        return null;
    } 
    
    if (!option) {
        alert('⚠️ Por favor, selecione uma opção de recebimento (Entrega ou Retirada).');
        return null;
    }

    const isDelivery = option === 'Entrega';
    
    if (isDelivery && !address) {
        alert('⚠️ Por favor, preencha o seu endereço de entrega (Rua, Número e Bairro são obrigatórios).');
        document.getElementById('address')?.focus();
        return null;
    }

    // Processamento e Montagem
    let finalTotal = currentOrder.totalValue;
    if (isDelivery) {
        finalTotal += DELIVERY_FEE;
    }

    let message = `Olá, Doces da Gi! Meu nome é *${name}* e gostaria de fazer o seguinte pedido:\n\n`;
    message += '--- ITENS DO PEDIDO ---\n';
    
    currentOrder.doces.forEach((item, index) => {
        const itemTotal = item.selectedPrice * item.quantity;
        message += `\n*${index + 1}. ${item.doce}*\n`;
        message += `   Sabor: ${item.selectedFlavor || 'Único'} (R$ ${item.selectedPrice.toFixed(2)}/un)\n`;
        message += `   Quantidade: ${item.quantity}\n`;
        message += `   Subtotal: R$ ${itemTotal.toFixed(2)}\n`;
    });
    
    message += `\n*VALOR TOTAL DOS DOCES: R$ ${currentOrder.totalValue.toFixed(2)}*\n`; 
    
    message += '\n--- DETALHES FINAIS ---\n';
    message += `*Forma de Pagamento:* ${payment}\n`;
    message += `*Opção de Recebimento:* ${option}\n`;
    
    if (isDelivery) {
        message += `*Endereço:* ${address}\n`;
        message += `*Taxa de Entrega:* R$ ${DELIVERY_FEE.toFixed(2)}\n`; 
        message += `\n*VALOR FINAL (Doces + Entrega): R$ ${finalTotal.toFixed(2)}*\n`;
        message += '---------------------------------\n';
        message += 'Obrigado!';
    } else {
        message += '---------------------------------\n';
        message += 'Passarei para retirar o pedido. Obrigado!';
    }

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Reseta o estado do pedido (carrinho) e a interface do usuário.
 */
function resetOrder() {
    // 1. Limpa o estado global do pedido
    currentOrder.doces = [];
    currentOrder.selectedItem = null;
    currentOrder.totalValue = 0;

    // 2. Limpa os campos do formulário
    clientNameInput.value = '';
    
    // Desmarca os rádios de pagamento e recebimento
    document.querySelectorAll('input[name="payment-method"]:checked').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="delivery-option"]:checked').forEach(radio => radio.checked = false);
    
    // Oculta e limpa o campo de endereço
    addressGroup.style.display = 'none';
    addressGroup.innerHTML = `
        <label for="address">Endereço de Entrega:</label>
        <textarea id="address" name="address" rows="2" placeholder="Rua, Número, Bairro, Ponto de Referência"></textarea>
    `;

    // 3. Atualiza a interface para o estado inicial
    renderCartSummary(); // Volta para "Carrinho Vazio"
    orderDetailsDiv.innerHTML = '<p>Selecione um doce no cardápio para começar a montar seu pedido.</p>';
    updateReadyStatus(); // Garante que o status e o botão "Finalizar" reflitam o carrinho vazio
}


/**
 * Gerencia o envio do formulário.
 */
function handleSubmit(event) {
    event.preventDefault(); 
    
    const whatsappLink = generateWhatsAppMessage();
    
    if (whatsappLink) {
        window.open(whatsappLink, '_blank');
        
        // Chamada da função de reset APÓS o envio
        resetOrder(); 
        
        updateOrderStatus('✅ Pedido enviado! Verifique seu WhatsApp para confirmar. O carrinho foi zerado.');
        
    } else {
        // Essa mensagem só deve aparecer se a pessoa ignorar os alertas e ainda assim o link for nulo
        updateOrderStatus('Erro ao gerar pedido. Verifique os campos.');
    }
}

// ------------------------------------------------
// Inicialização do Cardápio e Event Listeners
// ------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    renderCartSummary(); 

    // Monitora Opções de Recebimento e a lógica de Endereço
    deliveryOptionRadios.forEach(radio => {
        radio.addEventListener('change', handleDeliveryOptionChange);
    });

    orderForm.addEventListener('submit', handleSubmit);
    
    // Monitora o campo Nome
    clientNameInput.addEventListener('input', updateReadyStatus);

    // Monitora os campos de Pagamento
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', updateReadyStatus);
    });
    
    // Monitora os campos de Recebimento
    deliveryOptionRadios.forEach(radio => {
        radio.addEventListener('change', updateReadyStatus);
    });

    // Mensagem inicial...
    orderDetailsDiv.innerHTML = '<p>Selecione um doce no cardápio para começar a montar seu pedido.</p>';
    updateOrderStatus('Clique em "Fazer Pedido" para começar.');
});