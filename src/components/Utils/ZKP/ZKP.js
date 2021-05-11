import React, { Component } from 'react';
import { MDBBtn, MDBContainer, MDBInput, MDBIcon } from 'mdbreact';
import { withToastManager } from 'react-toast-notifications';
import computeProof from '../../../utils/ZkpUtils';
import SectionContainer from '../../SectionContainer';
import Spinner from '../../Spinner';
import proofExample from '../../../assets/proofExample.json';

class ZKP extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      preimage: '',
      proof: {},
    };
  }

  submitHandler = async (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    try {
      setTimeout(async () => {
        const proof = await computeProof(this.state.preimage);
        this.setState({ loading: false, proof });
        document.getElementById('downloadProof').click();
      }, 10);
    } catch (error) {
      this.props.toastManager.add(
        `Impossible d'exporter la preuve, veuillez réessayer`,
        {
          appearance: 'error',
        },
      );
      this.setState({ loading: false });
    }
  };

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { loading, proof } = this.state;
    return (
      <MDBContainer>
        <SectionContainer
          title='Modules Zero Knowledge Proof'
          header='Exportation de preuve'
        >
          <form onSubmit={this.submitHandler}>
            <MDBInput
              label='Mot de passe'
              icon='key'
              type='password'
              validate
              required
              size='sm'
              name='preimage'
              onChange={this.changeHandler}
            />
            <MDBBtn color='success' type='submit'>
              Exporter preuve de mot de passe
            </MDBBtn>
            <span>
              <MDBIcon far icon='clock' className='mx-2' />
              {`Temps estimé < 40s`}
            </span>
            {loading ? <Spinner /> : <div />}
          </form>
          <a
            className='invisible'
            id='downloadProof'
            download='proof.json'
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(proof, null, 2),
            )}`}
          >
            {' '}
          </a>
        </SectionContainer>
        <SectionContainer header='Comment ça marche ?'>
          <p>
            Pour générer une preuve, le circuit est long et complexe. Le temps
            peut varier en fonction de la compléxité de la preuve.
            <br />
            Par exemple, prouver que l&apos;on connait les diviseurs premiers de
            28273738 sans les révéler sera plus long que de prouver que 1+1=2
            sans révéler les termes mais uniquement la somme de l&apos;addition.
          </p>
          <p>
            Ici, la preuve est une preuve Zk-Snark générée grâce à la librairie{' '}
            <a
              href='https://github.com/Zokrates/ZoKrates'
              target='_blank'
              rel='noreferrer'
              className='text-decoration-none'
            >
              ZoKrates
            </a>{' '}
            directement dans le navigateur.{' '}
            <b>
              Le mot de passe ne circule pas sur le web, il reste sur votre
              ordinateur.
            </b>
          </p>
          <u className='mb-2'>Les étapes de génération de la preuve sont :</u>
          <ol className='mb-2' type='A'>
            <li className='mb-2'>
              Compilation : Cette étape consiste à compiler un fichier{' '}
              <a
                target='_blank'
                href='/hash_proof.txt'
                className='text-decoration-none'
              >
                <i>.zok</i>
              </a>{' '}
              qui décrit de façon numérique ce qu&apos;on veut prouver. Le
              langage Zok est un langage inventé par Zokrates expressément dans
              ce but.
            </li>
            <li className='mb-2'>
              Setup de clés : Une clé de vérification et une clé de preuve sont
              générées. La clé de vérification va servir à vérifier les preuves,
              on la retrouvera donc dans le smart contract <i>verifier.sol</i>{' '}
              qui a été déployé sur la blockchain. La clé de preuve va servir à
              créer les preuves et à encrypter les inputs.
            </li>
            <li className='mb-2'>
              Calcul de témoin : Cette étape prend en paramètre la compilation
              de l&apos;étape A et l&apos;input de la preuve. Un fichier non
              crypté témoin de la validité de l&apos;assertion est alors
              produit.
            </li>
            <li className='mb-2'>
              Calcul de preuve : Ici, le témoin précédent est reprit puis crypté
              avec la clé de preuve. Une explication de la preuve obtenue est
              décrite plus bas.
            </li>
          </ol>
          <p>
            Bien sûr, certaines étapes ne sont effectuées qu&apos;une fois lors
            du setup, pour gagner du temps, comme les étapes A et B.
          </p>
        </SectionContainer>
        <SectionContainer header='Explication du fichier "proof.json"'>
          <u className='font-weight-bolder'>
            Voici un exemple de preuve de <i>*preimage</i> de hash :
          </u>
          <pre>{JSON.stringify(proofExample, null, 2)}</pre>
          <p className='mt-2 mb-0'>
            Les éléments <code>a</code>, <code>b</code> et <code>c</code>{' '}
            dépendent de la clé cryptographique de génération de preuve.
            C&apos;est une forme cryptée de l&apos;input, autrement dit du mot
            de passe.
          </p>
          <p className='mb-0'>
            L&apos;élément <code>inputs</code> représente le hash (sha256) sous
            forme hexadécimal et séparé en deux tableaux de tailles égales,
            format requis par la librairie{' '}
            <a
              href='https://github.com/Zokrates/ZoKrates'
              target='_blank'
              rel='noreferrer'
              className='text-decoration-none'
            >
              ZoKrates
            </a>
            , du mot de passe.
          </p>
          <p>
            La preuve est valide si <code>a</code>, <code>b</code> et{' '}
            <code>c</code> sont bien la <i>*preimage</i> de <code>inputs</code>.
          </p>
          <br />
          <p className='font-italic'>
            *Une préimage est l&apos;input que l&apos;on rentre dans une
            fonction de hashage. A chaque input existe un unique hash et à
            chaque hash existe un unique input.
          </p>
        </SectionContainer>
      </MDBContainer>
    );
  }
}

export default withToastManager(ZKP);
