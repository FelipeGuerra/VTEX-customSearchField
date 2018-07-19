function customSearchField() {
    $('#searchterm').on('keyup', function (e) {
        var searchTerm = $(this).val();
    
        if (e.which == 13) {
            var searchutmi = searchTerm + "?&utmi_p=_&utmi_pc=BuscaCustom&utmi_cp=" + searchTerm;
            if (searchTerm != "") {
                window.location.href = window.location.origin + '/' + searchutmi
            }
            return false;
        }
    
        if (searchTerm.length > 3) {
            $.ajax({
                type: 'get',
                url: "/buscaautocomplete/",
                dataType: "json",
                data: {
                    maxRows: 12,
                    productNameContains: searchTerm
                },
                beforeSend: function () {
                    // this is where we append a loading image
                    $('.search_suggestions').html('<div class="loading"><img src="/arquivos/loading.gif" alt="Loading..." /></div>');
                },
                success: function (data) {
                    // successful request;
                    $('.search_suggestions').empty();
                    $('.search_suggestions .product-row').remove();
                    
                    data = data.itemsReturned;
                    $(data).each(function (i) {
                        var html = "";
                        // console.info(data)
                        if (data[i].thumb == "") {
                            html = '<li><a href="' + data[i].href + "?&utmi_p=_&utmi_pc=BuscaFRN&utmi_cp=" + searchTerm + '">' + data[i].name.split('  ')[1] + '</a></li>';
                            $('.search_suggestions').append(html);
                        }
                    });
                    
                    $.ajax({
                        type: 'get',
                        url: "/api/catalog_system/pub/products/search?ft=" + searchTerm + "&_from=0&_to=4",
                        dataType: "json",
                        success: function (data) {
                            $('.search_suggestions .product-row').remove();
                            $(data).each(function (i) {
    
                                var price = formatReal((data[i].items[0].sellers[0].commertialOffer.Price.toFixed(2)).toString().replace(/\D/g,'')),
                                    installment = data[i].items[0].sellers[0].commertialOffer.Installments,
                                    installmentPrice = 0,
                                    installmentNumber = 0;
    
                                for (var c = 0; c < installment.length; c++) {
                                    if (installment[c].Name == "Visa 6 vezes sem juros") {
                                        installmentPrice = formatReal((installment[c].Value.toFixed(2)).toString().replace(/\D/g,''));
                                        installmentNumber = installment[c].NumberOfInstallments;
                                    }
                                }
    
                                var html = "";
                                html = '<li class="product-row" data-sku-id="' + data[i].items[0].itemId + '">';
                                html += '<div class="sku-image">' + data[i].items[0].images[0].imageTag.replace('~/arquivos/', '/arquivos/').replace('#width#-#height#', '60-60') + '</div>';
                                html += '<div class="prod-info"><a href="' + data[i].link + "?&utmi_p=_&utmi_pc=BuscaFRN&utmi_cp=" + searchTerm + '">';
                                html += '<p class="skuname">' + data[i].productName + '</p>';
                                html += '<p class="skuprice">';
                                html += '    <span class="bestprice">Por: R$'+ price + '</span>';
                                if (installmentNumber !=0) {
                                    html += '    <span class="installment">ou '+installmentNumber+' de R$'+installmentPrice+'</span>';
                                }
                                html += '</p>';
                                html += '</a></div>';
                                if (data[i].items[0].sellers[0].commertialOffer.AvailableQuantity > 0) {
                                    html += '<div class="item-quantity">';
                                    html += '<span class="qtd-minus">-</span>';
                                    html += '<span class="qtd-more">+</span>';
                                    html += '<input class="sku-qtd" type="text" value="1" />';
                                    html += '</div>';
                                    html += '<span class="buy-item">COMPRAR</span>';
                                }
                                html += '</li>';
                                $('.search_suggestions').append(html);
                            });
                        }
                    });
    
                    $('.customsearch-autocomplete').show();
                },
                error: function () {
                    $('.search_suggestions').empty();
                    $('.search_suggestions').html('<p class="error"><strong>Oops!</strong> Tente novamente em instantes.</p>');
                    $('.customsearch-autocomplete').hide();
                }
            });
        } else {
            $('.search_suggestions').empty();
            $('.customsearch-autocomplete').hide();
        }
    });
    
    $('#getsearch').click(function () {
        var searchtherm = $(this).parent().find('#searchterm').val(),
            searchutmi = searchtherm + "?&utmi_p=_&utmi_pc=BuscaFRN&utmi_cp=" + searchtherm;
    
        if (searchtherm != "") {
            window.location.href = window.location.origin + '/' + searchutmi
        }
    });
    
    $('.busca-frn').on('click', '.qtd-minus', function () {
        if ($(this).parent().find('input').val() != 1) {
            $(this).parent().find('input').val(parseInt($(this).parent().find('input').val()) - 1);
        }
        $(this).parent().find('input').change();
    });
    $('.busca-frn').on('click', '.qtd-more', function () {
        $(this).parent().find('input').val(parseInt($(this).parent().find('input').val()) + 1);
        $(this).parent().find('input').change();
    });
    
    $('.busca-frn').on('click', '.buy-item', function () {
        var id = $(this).parents('li').attr('data-sku-id');
        var qtd_produto = $(this).parents('li').find('.sku-qtd').val();
        var itemsCart = [];
        var item = {
            id: parseInt(id),
            quantity: parseInt(qtd_produto),
            seller: 1
        };
        itemsCart.push(item);
    
        vtexjs.checkout.getOrderForm().done(function (orderForm) {
            vtexjs.checkout.addToCart(itemsCart).done(function () {
                Common.initQuickCart();
            });
        });
    });

    
    $(document).on('click', function (event) {
        if (!$(event.target).closest('.busca-frn .customsearch-autocomplete').length) {
            $('.busca-frn .customsearch-autocomplete').hide();
        }
    });
    
    if ($(window).width() < 1024) {
        $('.busca-frn').on('click', '.buy-item', function () {
            $('.customsearch-autocomplete').hide();
        });
    }
}