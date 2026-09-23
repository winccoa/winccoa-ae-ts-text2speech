# Third-Party Software Information

Note to Resellers: Please pass on this document to your customer to avoid license infringements.

This product, solution or service ("Product") contains third-party software components listed in this document. These components are Open Source Software licensed under a license approved by the Open Source Initiative (www.opensource.org) or similar licenses as determined by SIEMENS ("OSS") and/or commercial or freeware software components. With respect to the OSS components, the applicable OSS license conditions prevail over any other terms and conditions covering the Product. The OSS portions of this Product are provided royalty-free and can be used at no charge.

If SIEMENS has combined or linked certain components of the Product with/to OSS components licensed under the GNU LGPL version 2 or later as per the definition of the applicable license, and if use of the corresponding object file is not unrestricted ("LGPL Licensed Module", whereas the LGPL Licensed Module and the components that the LGPL Licensed Module is combined with or linked to is the "Combined Product"), the following additional rights apply, if the relevant LGPL license criteria are met: (i) you are entitled to modify the Combined Product for your own use, including but not limited to the right to modify the Combined Product to relink modified versions of the LGPL Licensed Module, and (ii) you may reverse-engineer the Combined Product, but only to debug your modifications. The modification right does not include the right to distribute such modifications and you shall maintain in confidence any information resulting from such reverse-engineering of a Combined Product.

Certain OSS licenses require SIEMENS to make source code available, for example, the GNU General Public License, the GNU Lesser General Public License and the Mozilla Public License. If such licenses are applicable and this Product is not shipped with the required source code, a copy of this source code can be obtained by anyone in receipt of this information during the period required by the applicable OSS licenses by contacting the following address:

Siemens AG  
LC TEC IT&SL  
Werner-von-Siemens Str. 60  
91052 Erlangen  
Germany

Keyword: Open Source Request (please specify Product name and version, if applicable)

SIEMENS may charge a handling fee of up to 5 EUR to fulfil the request.

## Warranty regarding further use of the Open Source Software

SIEMENS' warranty obligations are set forth in your agreement with SIEMENS. SIEMENS does not provide any warranty or technical support for this Product or any OSS components contained in it if they are modified or used in any manner not specified by SIEMENS. The license conditions listed below may contain disclaimers that apply between you and the respective licensor. For the avoidance of doubt, SIEMENS does not make any warranty commitment on behalf of or binding upon any third party licensor.

## Open Source Software and/or other third-party software contained in this Product:

Please note the following license conditions and copyright notices applicable to Open Source Software and/or other components (or parts thereof):

| Component | Open Source Software [Yes/No] | Acknowledgements/Comment | License conditions and copyright notices |
|-----------|------------------------------|-------------------------|----------------------------------------|
| heap-js - 2.7.1 | Yes | Runtime dependency | [BSD 3-Clause](#heap-js-271) |

### heap-js 2.7.1

BSD 3-Clause License

Copyright (c) 2017, Ignacio Lago
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

## External runtime prerequisites

The application example does not contain or redistribute the following operating-system components:

| Component | Platform | Usage |
|-----------|----------|-------|
| Microsoft System.Speech | Windows | Speech synthesis using installed Windows voices |
| eSpeak NG | Linux | Speech synthesis using a separately installed `espeak-ng` executable |

eSpeak NG is licensed under GPL-3.0-or-later. Install it separately through the Linux distribution's package manager. Its license and source availability are provided by the selected distribution/package supplier.

For CVE-2023-49990 through CVE-2023-49994, use at least Debian 11 `1.50+dfsg-7+deb11u2`, Debian 12 `1.51+dfsg-10+deb12u1`, Ubuntu 20.04 LTS `1.50+dfsg-6ubuntu0.1`, or Ubuntu 22.04 LTS `1.50+dfsg-10ubuntu0.1`. Ubuntu 24.04 LTS is listed as not affected by Ubuntu USN-6858-1. Windows and Linux operating-system components must receive the vendor's current security updates.
