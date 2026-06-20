import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { GraduationCap, MapPin, Award, CheckCircle, Share2, Copy, Camera } from 'lucide-react';
import SEO from '../components/SEO';

export default function ContestantProfilePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [contestant, setContestant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [activeComp, setActiveComp] = useState<any>(null);
  const [compLoading, setCompLoading] = useState(true);

  // Voting state
  const [voteAmount, setVoteAmount] = useState(10);
  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const PRICE_PER_VOTE = bankDetails?.vote_cost ? Number(bankDetails.vote_cost) : 100; // Default to NGN 100 per vote if not set

  useEffect(() => {
    fetch(`/api/contestants/${id}`)
      .then(res => res.json())
      .then(data => {
        setContestant(data);
        setLoading(false);
      })
      .catch(console.error);

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setBankDetails(data))
      .catch(console.error);

    fetch('/api/competitions/active')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setActiveComp(data);
        }
        setCompLoading(false);
      })
      .catch(err => {
        console.error(err);
        setCompLoading(false);
      });

    if (searchParams.get('vote') === 'true') {
      setTimeout(() => {
        document.getElementById('vote-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [id, searchParams]);

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus('loading');
    
    try {
      const res = await fetch('/api/votes/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestant_id: id,
          amount: voteAmount,
          price: voteAmount * PRICE_PER_VOTE,
          voter_name: voterName,
          voter_email: voterEmail,
          proof_url: proofUrl
        })
      });
      const data = await res.json();
      
      // Simulate successful payment redirect/callback
      if (data.tx_ref) {
        await fetch('/api/votes/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tx_ref: data.tx_ref })
        });
        setPaymentStatus('success');
        // update local state
        setContestant(c => ({...c, total_votes: c.total_votes + voteAmount}));
      }
    } catch (err) {
      console.error(err);
      setPaymentStatus('error');
    }
  };

  const now = new Date();
  const votingHasNotStarted = activeComp && activeComp.start_date && !isNaN(new Date(activeComp.start_date).getTime()) && now < new Date(activeComp.start_date);
  const votingHasEnded = !activeComp || !activeComp.end_date || isNaN(new Date(activeComp.end_date).getTime()) || now > new Date(activeComp.end_date);

  if (loading) return <div className="p-20 text-center text-neutral-500">Loading profile...</div>;
  if (!contestant) return <div className="p-20 text-center text-neutral-500">Contestant not found.</div>;

  const contestantDescription = contestant.bio 
    ? `${contestant.name} represents ${contestant.institution} (${contestant.department}, Level ${contestant.level}) on UNI9JA MEDIA: "${contestant.bio}"`
    : `Support ${contestant.name} representing ${contestant.institution} (${contestant.department}, Level ${contestant.level}) in the ongoing UNI9JA MEDIA voting competition!`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO 
        title={`Vote for ${contestant.name}`}
        description={contestantDescription}
        image={contestant.photo_url || undefined}
        type="profile"
      />
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Profile Left */}
          <div className="bg-neutral-50 p-8 md:p-12 border-r border-neutral-200 flex flex-col items-center text-center">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl mb-6 bg-neutral-200">
              {contestant.photo_url ? (
                <img src={contestant.photo_url} alt={contestant.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">No Photo</div>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">{contestant.name}</h1>
            <div className="inline-flex items-center gap-2 bg-red-50 text-[#D60000] px-4 py-1.5 rounded-full font-bold mb-6">
              <Award className="w-5 h-5" />
              <span>{contestant.total_votes} Votes</span>
            </div>
            
            <div className="w-full space-y-4 text-left mt-4 border-t border-neutral-200 pt-8">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-neutral-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">Institution</h4>
                  <p className="text-neutral-600">{contestant.institution}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-neutral-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">Department / Level</h4>
                  <p className="text-neutral-600">{contestant.department} - {contestant.level}L</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 w-full">
              <button onClick={(e) => { 
                 navigator.clipboard.writeText(window.location.href); 
                 const el = e.currentTarget; 
                 const orig = el.innerHTML; 
                 el.innerHTML = '<span class="flex items-center gap-2"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!</span>'; 
                 setTimeout(() => el.innerHTML = orig, 2000); 
               }} className="w-full py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                 <Copy className="w-4 h-4" /> Copy Voting Link
               </button>
            </div>
          </div>

          {/* Voting Right */}
          <div id="vote-section" className="p-8 md:p-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Support {contestant.name.split(' ')[0]}</h2>
            <p className="text-neutral-500 mb-8">Purchase votes securely below. 1 Vote = NGN {PRICE_PER_VOTE}</p>

            {compLoading ? (
              <div className="p-8 text-center text-neutral-500">Checking voting status...</div>
            ) : votingHasEnded ? (
              <div className="bg-neutral-50 border border-neutral-200 text-neutral-800 p-8 rounded-2xl flex flex-col items-center text-center">
                <svg className="w-16 h-16 text-neutral-400 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-2xl font-bold mb-2 text-neutral-900">Voting is Locked</h3>
                <p className="text-neutral-500 max-w-sm">Voting has officially ended for this competition. No additional votes can be accepted at this time.</p>
              </div>
            ) : votingHasNotStarted ? (
              <div className="bg-neutral-50 border border-neutral-200 text-neutral-800 p-8 rounded-2xl flex flex-col items-center text-center">
                <svg className="w-16 h-16 text-yellow-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold mb-2 text-neutral-900">Voting Starts Soon</h3>
                <p className="text-neutral-500 max-w-sm">Voting has not started yet. It will open on {activeComp && activeComp.start_date && !isNaN(new Date(activeComp.start_date).getTime()) ? new Date(activeComp.start_date).toLocaleString() : 'the set start date'}.</p>
              </div>
            ) : paymentStatus === 'success' ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-2xl flex flex-col items-center text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Payment Proof Submitted!</h3>
                <p>Thank you for supporting {contestant.name}. Your votes will be added once the admin verifies your payment proof.</p>
                <button onClick={() => setPaymentStatus(null)} className="mt-6 px-6 py-2 bg-green-600 text-white rounded-full font-semibold">Vote Again</button>
              </div>
            ) : (
              <form onSubmit={handleVote} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-3">Select Vote Package</label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[10, 50, 100, 500].map(amt => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setVoteAmount(amt)}
                        className={`py-3 rounded-xl border-2 font-bold transition-all ${voteAmount === amt ? 'border-[#D60000] bg-red-50 text-[#D60000]' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                      >
                        {amt} Votes
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-semibold text-neutral-900 mb-1">Custom Number of Votes</label>
                  <input type="number" min="1" value={voteAmount} onChange={(e) => setVoteAmount(Number(e.target.value) || 1)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#D60000] focus:border-[#D60000]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-1">Your Name</label>
                    <input type="text" required value={voterName} onChange={(e) => setVoterName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#D60000] focus:border-[#D60000]" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-1">Your Email</label>
                    <input type="email" required value={voterEmail} onChange={(e) => setVoterEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#D60000] focus:border-[#D60000]" placeholder="john@example.com" />
                  </div>
                </div>

                {bankDetails && (bankDetails.bank_name || bankDetails.account_number) && (
                  <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-2xl">
                    <h4 className="font-bold text-neutral-900 mb-3 text-sm">Please transfer <span className="text-[#D60000]">NGN {(voteAmount * PRICE_PER_VOTE).toLocaleString()}</span> to the account below:</h4>
                    <div className="space-y-2 text-sm text-neutral-700">
                      <div className="flex justify-between">
                        <span className="font-medium">Bank Name:</span>
                        <span className="font-bold">{bankDetails.bank_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Account Name:</span>
                        <span className="font-bold">{bankDetails.account_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Account Number:</span>
                        <span className="font-bold">{bankDetails.account_number}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-neutral-900 mb-2">Proof of Payment</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 hover:border-[#D60000] transition-colors">
                    {proofUrl ? (
                      <div className="relative group flex-shrink-0 animate-fade-in">
                        <img 
                          src={proofUrl} 
                          alt="Proof of Payment" 
                          className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border border-neutral-200 shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-neutral-200 flex items-center justify-center border border-neutral-300 flex-shrink-0">
                        <Camera className="w-6 h-6 text-neutral-400" />
                      </div>
                    )}
                    <div className="flex-grow w-full space-y-2 text-center sm:text-left">
                      <div className="relative inline-block w-full">
                        <input 
                          type="file" 
                          id="payment-proof-upload"
                          required={!proofUrl} 
                          accept="image/*" 
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              const formDataUpload = new FormData();
                              formDataUpload.append('file', file);
                              try {
                                setPaymentStatus('uploading_proof');
                                const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data.error);
                                setProofUrl(data.url);
                                setPaymentStatus(null);
                              } catch (err: any) {
                                setPaymentStatus('error');
                                setTimeout(() => setPaymentStatus(null), 3000);
                              }
                            }
                          }} 
                          className="hidden"
                        />
                        <label 
                          htmlFor="payment-proof-upload" 
                          className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 select-none cursor-pointer transition-colors shadow-sm"
                        >
                          Select Receipt Screenshot
                        </label>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-tight">Upload bank statement or transfer receipt screenshot so admin can verify payment</p>
                      {proofUrl && (
                        <p className="text-xs text-green-600 font-semibold flex items-center justify-center sm:justify-start gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          Receipt uploaded successfully!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex justify-between items-center mt-4">
                  <span className="font-semibold text-neutral-600">Total to Pay:</span>
                  <span className="text-2xl font-black text-neutral-900">NGN {(voteAmount * PRICE_PER_VOTE).toLocaleString()}</span>
                </div>

                <button type="submit" disabled={paymentStatus === 'loading' || paymentStatus === 'uploading_proof' || !proofUrl} className="w-full py-4 bg-[#D60000] hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-colors flex justify-center items-center disabled:opacity-50">
                  {paymentStatus === 'loading' ? 'Processing...' : paymentStatus === 'uploading_proof' ? 'Uploading Proof...' : 'Submit Payment Proof & Vote'}
                </button>
                <p className="text-xs text-neutral-500 text-center flex items-center justify-center gap-1">Votes will be approved after admin verifies proof</p>
              </form>
            )}
            
            {/* Bio Section */}
            {contestant.bio && (
               <div className="mt-12 pt-8 border-t border-neutral-200">
                 <h3 className="text-xl font-bold text-neutral-900 mb-4">About Me</h3>
                 <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">{contestant.bio}</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
