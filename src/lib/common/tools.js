export default {
    /**
    * 发送http GET
    * @param {String} url 请求url
    * @param {Function} callback 请求成功回调函数
    */

    httpGet: function httpGet(url, callback) {
        // XMLHttpRequest对象用于在后台与服务器交换数据   
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            // readyState == 4说明请求已完成
            if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
                // 从服务器获得数据 
                callback.call(this, JSON.parse(xhr.responseText));
            }
        };
        xhr.send();
    },

    /**
     * 发送http POST
     * @param {String} url 请求url
     * @param {Ojbect} data 将要发送的数据包装为对象
     * @param {Function} callback 请求成功回调函数
     */
    httpPost: function httpPost(url, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        // 添加http头，发送信息至服务器时内容编码类型
        // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                callback.call(this, JSON.parse(xhr.responseText));
            }
        };
        xhr.send(JSON.stringify(data));
    }
}