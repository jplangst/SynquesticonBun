openssl req -x509 -new -nodes -days 3650 -keyout my-root-ca.key -out my-root-ca.crt -config root-ca.cnf.txt

"ROOT CA FILE":
[ req ]
default_bits       = 2048
prompt             = no
distinguished_name = dn
x509_extensions    = v3_ca

[ dn ]
C  = US
ST = State
L  = City
O  = MyOrg
CN = My Custom Root CA

[ v3_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:TRUE
keyUsage = critical, keyCertSign, cRLSign
"END FILE"

"SERVER SSL CONF FILE:"
[ req ]
default_bits       = 2048
prompt             = no
distinguished_name = req_distinguished_name
req_extensions     = v3_req

[ req_distinguished_name ]
C  = US
ST = State
L  = City
O  = Example Org
CN = 192.168.0.111

[ v3_req ]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[ alt_names ]
IP.1 = 192.168.0.111
DNS.1 = localhost
"END FILE"

openssl req -new -nodes -out server.csr -keyout server.key -config server-cert.cnf.txt

openssl x509 -req -in server.csr -CA my-root-ca.crt -CAkey my-root-ca.key -CAcreateserial -out server.crt -days 3650 -extfile server-cert.cnf.txt -extensions v3_req