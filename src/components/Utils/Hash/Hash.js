import React, { Component } from 'react';
import { MDBContainer, MDBInput } from 'mdbreact';
import SectionContainer from '../../SectionContainer';
import { HashUtils } from '../../../utils/HashUtils';

class Hash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      preimage: '',
    };
  }

  changeHandler = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { preimage } = this.state;
    return (
      <MDBContainer>
        <SectionContainer
          title='Modules de hachage'
          header='Génération de hash de mot passe'
        >
          <MDBInput
            data-testid='hashInput'
            label='Mot de passe'
            icon='key'
            type='password'
            size='sm'
            name='preimage'
            onChange={this.changeHandler}
          />
          <p className='font-weight-bold' data-testid='hash'>
            Hash :{' '}
            {preimage === ''
              ? ''
              : `0x${HashUtils.getHashFromString(preimage)}`}
          </p>
        </SectionContainer>
        <SectionContainer header='Explication de la fonction de hachage'>
          <u className='font-weight-bolder mb-3'>
            Qu&apos;est ce qu&apos;une fonction de hachage ?
          </u>
          <p className='mb-2'>
            Une fonction de hachage est un procédé cryptographique, qui agit
            comme une fonction mathématique.{' '}
            <b>
              Elle prend un paramètre en entrée qui peut être un nombre, un mot
              ou une phrase et renvoie en sortie un hexadécimal qu&apos;on
              appelle un hash.
            </b>{' '}
            Le hash en sortie est de taille fixe, et ce pour n&apos;importe quel
            paramètre en entrée.
          </p>
          <p className='mb-2'>
            Il existe plusieurs fonctions de hashage, cependant une fonction de
            hashage est considérée comme sécurisée si et seulement si pour un
            unique paramètre en entrée, on a un unique hash et réciproquement.
            De plus, il est impossible de retrouver le paramètre en entrée en ne
            possédant que le hash.
          </p>
          <p className='mb-4'>
            La fonction <b>sha256</b> est une des fonctions de hashage les plus
            sûre et majoritairement utilisée dans la blockchain, c&apos;est
            pourquoi c&apos;est celle que nous utilisons ici.
          </p>
          <u className='font-weight-bolder mb-3'>
            Qu&apos;elles sont les caractéristiques particulières de notre hash
            ?
          </u>
          <p>
            Si vous prenez votre mot de passe et que vous le mettez dans un
            autre générateur de hash <i>sha256</i>, d&apos;après la définition
            d&apos;une fonction de hashage le hash en sortie doit être identique
            à celui que nous fournissons. Cependant ce n&apos;est pas le cas.
            Ceci est dû au fait que la librairie{' '}
            <a
              href='https://github.com/Zokrates/ZoKrates'
              target='_blank'
              rel='noreferrer'
              className='text-decoration-none'
            >
              ZoKrates
            </a>
            , que nous utilisons pour générer les preuves Zero Knowledge Proof
            prend un paramètre en entrée de taille fixe de 512 bits.{' '}
            <b>
              Le mot de passe est donc complété avec des bits nuls pour avoir la
              taille adéquate.
            </b>
          </p>
        </SectionContainer>
      </MDBContainer>
    );
  }
}

export default Hash;
