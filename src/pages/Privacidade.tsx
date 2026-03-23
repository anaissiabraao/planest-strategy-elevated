import { Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border">
        <div className="section-padding max-w-[1000px] mx-auto flex items-center justify-between h-16">
          <Link to="/">
            <img src={logo} alt="Planest" className="h-10 w-10 rounded-lg object-cover" />
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Voltar ao início
          </Link>
        </div>
      </nav>

      <main className="section-padding max-w-[1000px] mx-auto py-16 space-y-12">
        <h1 className="font-heading text-4xl md:text-5xl font-bold">Política de Privacidade e Termos de Serviço</h1>

        {[
          {
            title: "SEÇÃO 1 – O QUE FAZEMOS COM AS SUAS INFORMAÇÕES?",
            content: `Quando você usa o Planest, como parte do processo de compra e venda, coletamos as informações pessoais que você nos fornece, tais como seu nome, endereço e e-mail.\n\nQuando você navega pela nosso site e ferramenta, recebemos também automaticamente o protocolo de internet do seu computador (endereço de IP) a fim de obter informações que nos ajudam a saber mais sobre seu navegador e sistema operacional.\n\nMarketing por e-mail (quando aplicável): Com sua permissão, podemos lhe enviar e-mails sobre nosso software, novos produtos e outras atualizações.`,
          },
          {
            title: "SEÇÃO 2 – CONSENTIMENTO",
            content: `Como vocês obtêm meu consentimento?\n\nQuando você nos fornece as suas informações pessoais para completar uma transação, verificar seu cartão de crédito, fazer um pedido, providenciar uma entrega ou retornar uma compra, você está concordando com a nossa coleta e uso de informações pessoais apenas para esses fins específicos.\n\nSe pedirmos suas informações pessoais por uma razão secundária, como marketing, vamos pedir seu consentimento, ou te dar a oportunidade de dizer não.\n\nComo posso retirar o meu consentimento?\n\nCaso depois de fornecer seus dados você mude de ideia, você pode retirar o seu consentimento quando quiser e assim evitar que entremos em contato para obter ou divulgar informações. Entre em contato conosco.`,
          },
          {
            title: "SEÇÃO 3 – DIVULGAÇÃO",
            content: `Podemos divulgar suas informações pessoais se formos obrigados por lei a fazê-lo ou se você violar nossos Termos de serviço.`,
          },
          {
            title: "SEÇÃO 4 – HOST",
            content: `Nossa loja é hospedada em um host particular, e eles nos fornecem uma plataforma online que nos permite oferecer o software.\n\nSeus dados estão armazenados através do armazenamento de dados, de bancos de dados e do aplicativo geral. Eles armazenam dados em um servidor seguro protegido por firewall.\n\nPagamento:\n\nSe você escolher um gateway de pagamento direto para completar a sua compra, o site armazena seus dados de cartão de crédito. Eles são criptografados através do Padrão de segurança de dados do setor de pagamento com cartão (PCI-DSS). Seus dados de transação de compra são armazenados apenas pelo período necessário para completar sua transação de compra. Depois de finalizar a compra, suas informações de transação de compra são apagadas.\n\nTodos os gateways de pagamento direto aderem aos padrões definidos pela PCI-DSS, que são gerenciados pelo Conselho de normas de segurança PCI. Ele é um esforço conjunto de marcas como Visa, MasterCard, American Express e Discover.\n\nOs requisitos da PCI-DSS ajudam a garantir a utilização segura de informações de cartão de crédito pela nossa loja e seus provedores de serviço.`,
          },
          {
            title: "SEÇÃO 5 – SERVIÇOS DE TERCEIROS",
            content: `No geral, nossos fornecedores terceirizados irão coletar, usar e divulgar suas informações apenas na medida do necessário para permitir que eles realizem os serviços que eles nos fornecem.\n\nEntretanto, certos prestadores de serviços terceirizados, tais como consultores, gateways de pagamento e outros processadores de transações de pagamento, têm suas próprias políticas de privacidade em relação à informação que somos obrigados a fornecer para eles sobre transações relacionadas a compras.\n\nPara esses fornecedores, recomendamos que você leia suas políticas de privacidade para que você possa entender de que maneira suas informações pessoais serão usadas por esses fornecedores.\n\nEspecificamente, lembre-se que certos fornecedores podem estar localizados ou possuir instalações que ficam em jurisdições diferentes da sua ou da nossa. Por isso, se você quiser continuar com uma transação que envolva um prestador de serviços terceirizado, suas informações podem ficar sujeitas à legislação da(s) jurisdição(ões) onde o prestador de serviços ou suas instalações estiverem localizados.\n\nPor exemplo, se você está no Canadá e sua transação é processada por um gateway de pagamento nos Estados Unidos, suas informações pessoais usadas para completar a transação podem estar sujeitas a divulgação sob a legislação dos Estados Unidos, incluindo a Lei Patriótica.\n\nUma vez que você sair do site da nossa loja ou for redirecionado para um aplicativo ou site de terceiros, você não será mais regido por essa Política de privacidade ou pelos Termos de serviço do nosso site.\n\nLinks\n\nQuando você clicar em links no nosso site, eles podem lhe direcionar para fora do nosso site. Não somos responsáveis pelas práticas de privacidade de outros sites e lhe incentivamos a ler as políticas de privacidade deles.`,
          },
          {
            title: "SEÇÃO 6 – SEGURANÇA",
            content: `Para proteger suas informações pessoais, tomamos precauções e seguimos as melhores práticas da indústria para nos certificar que elas não sejam perdidas, usurpadas, acessadas, divulgadas, alteradas ou destruídas.\n\nSe você nos fornecer as suas informações de cartão de crédito, elas serão criptografadas usando a tecnologia 'secure socket layer' (SSL) e armazenadas com criptografia AES-256. Embora nenhum método de transmissão pela Internet ou armazenamento eletrônico seja 100% seguro, nós seguimos todos os requisitos da PCI-DSS e implementamos medidas adicionais aceitas pelos padrões da indústria.\n\nCOOKIES\n\nNosso site armazena cookies para melhor atender nossos clientes.`,
          },
          {
            title: "SEÇÃO 7 – IDADE DE CONSENTIMENTO",
            content: `Ao usar esse site, você confirma que você é maior de idade em seu estado ou província de residência e que você nos deu seu consentimento para permitir que qualquer um dos seus dependentes menores de idade usem esse site.`,
          },
          {
            title: "SEÇÃO 8 – ALTERAÇÕES NA POLÍTICA DE PRIVACIDADE",
            content: `Reservamos o direito de modificar essa política de privacidade a qualquer momento. Portanto, por favor, leia-a com frequência. As alterações e esclarecimentos surtem efeito imediatamente após serem publicadas no site. Caso façamos alterações na política de privacidade, iremos notificá-lo sobre a atualização. Assim, você saberá quais informações coletamos, como as usamos, e sob que circunstâncias, caso aplicável, as utilizaremos e/ou divulgaremos.\n\nCaso ocorra a fusão da nossa loja com outra empresa, suas informações podem ser transferidas para os novos proprietários para que possamos continuar vendendo produtos para você.`,
          },
          {
            title: "PERGUNTAS E INFORMAÇÕES DE CONTATO",
            content: `Se você gostaria de acessar, corrigir, alterar ou excluir quaisquer informações pessoais que temos sobre você, registre uma queixa, ou simplesmente peça mais informações de contato a(o) nosso(a) Diretor(a) de privacidade.`,
          },
          {
            title: "LGPD",
            content: `Implantação da LGPD – Baah & Planest: https://www.baah.com.br/lgpd.pdf\n\nRelatório de Impacto à Proteção de Dados Pessoais 2021: https://www.baah.com.br/relatorio_lgpd.pdf\n\nContrato de Tratamento de Dados para Clientes e Parceiros: https://www.baah.com.br/contrato_lgpd.pdf\n\nO encarregado de dados pessoais (DPO), o contato com ele é feito pelo e-mail: planest@planest.com.br\n\nCaso você precise de esclarecimentos e informações sobre proteção de dados pessoais e privacidade ou ainda caso precise do contato do encarregado de dados basta enviar um e-mail para baah@baah.com.br`,
          },
        ].map((section, i) => (
          <div key={i} className="space-y-4">
            <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground">
              {section.title}
            </h2>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </main>

      <footer className="py-8 border-t border-border">
        <div className="section-padding max-w-[1000px] mx-auto text-center text-sm text-muted-foreground">
          © 2026 Planest. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
